using Microsoft.AspNetCore.Http;
using System.Diagnostics;
using System.Security.Claims;
using System.Text.Json;
using TalentTrack2.Data;
using TalentTrack2.Models;

namespace TalentTrack2.Middleware
{
    public class AuditLogMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly HashSet<string> _auditableMethods = new() { "POST", "PUT", "DELETE" };
        private readonly HashSet<string> _auditableEndpoints = new() 
        { 
            "/api/jobs", 
            "/api/applications/apply", 
            "/api/admin/approve-job",
            "/api/admin/reject-job",
            "/api/admin/users"
        };

        public AuditLogMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
        {
            _next = next;
            _serviceScopeFactory = serviceScopeFactory;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Filter for auditable requests
            if (!_auditableMethods.Contains(context.Request.Method) || 
                !IsAuditablePath(context.Request.Path))
            {
                await _next(context);
                return;
            }

            var stopwatch = Stopwatch.StartNew();
            var requestBody = await ReadRequestBody(context.Request);
            
            // Continue pipeline
            await _next(context);
            
            stopwatch.Stop();

            // Log after response
            await LogAuditAsync(context, requestBody, stopwatch.ElapsedMilliseconds);
        }

        private bool IsAuditablePath(PathString path)
        {
            // Check if path starts with any of the auditable endpoints
            return _auditableEndpoints.Any(e => path.StartsWithSegments(e));
        }

        private async Task<string> ReadRequestBody(HttpRequest request)
        {
            request.EnableBuffering();
            using var reader = new StreamReader(request.Body, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            return body;
        }

        private async Task LogAuditAsync(HttpContext context, string requestBody, long durationMs)
        {
            try
            {
                using var scope = _serviceScopeFactory.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? 
                             context.User.FindFirstValue("UserId");

                // Extract entity ID if possible (simplified logic)
                string? entityId = null;
                if (context.Request.RouteValues.TryGetValue("id", out var idValue))
                {
                    entityId = idValue?.ToString();
                }

                // Sanitize body (remove passwords, etc. - simplified for now)
                var sanitizedBody = requestBody.Length > 1000 ? requestBody.Substring(0, 1000) + "..." : requestBody;

                var auditLog = new AuditLog
                {
                    UserId = userId,
                    ActionType = context.Request.Method,
                    EntityName = context.Request.Path, // Using path as entity name proxy
                    EntityId = entityId,
                    DetailsJson = sanitizedBody,
                    IpAddress = context.Connection.RemoteIpAddress?.ToString(),
                    ResponseStatusCode = context.Response.StatusCode,
                    DurationMs = durationMs,
                    Timestamp = DateTime.UtcNow
                };

                dbContext.AuditLogs.Add(auditLog);
                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Fail silently to not affect the main request
                Console.WriteLine($"Audit logging failed: {ex.Message}");
            }
        }
    }
}
