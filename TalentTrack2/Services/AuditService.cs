using Microsoft.EntityFrameworkCore;
using TalentTrack2.Data;
using TalentTrack2.Models;

namespace TalentTrack2.Services
{
    public interface IAuditService
    {
        Task<(IEnumerable<AuditLog> Logs, int TotalCount)> GetAuditLogsAsync(int page, int pageSize, string? entity = null);
    }

    public class AuditService : IAuditService
    {
        private readonly ApplicationDbContext _context;

        public AuditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(IEnumerable<AuditLog> Logs, int TotalCount)> GetAuditLogsAsync(int page, int pageSize, string? entity = null)
        {
            var query = _context.AuditLogs.AsQueryable();

            if (!string.IsNullOrEmpty(entity))
            {
                query = query.Where(l => l.EntityName.Contains(entity));
            }

            var totalCount = await query.CountAsync();
            
            var logs = await query
                .OrderByDescending(l => l.Timestamp)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (logs, totalCount);
        }
    }
}
