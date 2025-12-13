using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TalentTrack2.Models;
using TalentTrack2.Services;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Policy = TalentTrack2.Authorization.Permissions.Audit.View)]
    public class AuditController : ControllerBase
    {
        private readonly IAuditService _auditService;

        public AuditController(IAuditService auditService)
        {
            _auditService = auditService;
        }

        [HttpGet]
        public async Task<ActionResult> GetAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? entity = null)
        {
            var (logs, totalCount) = await _auditService.GetAuditLogsAsync(page, pageSize, entity);
            
            return Ok(new
            {
                Data = logs,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }
    }
}
