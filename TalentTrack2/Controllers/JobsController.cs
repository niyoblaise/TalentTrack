using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentTrack2.Data;
using TalentTrack2.DTOs;
using TalentTrack2.Models;

using TalentTrack2.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public JobsController(ApplicationDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // GET: api/jobs - List all jobs (Public/Employee)
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<JobResponseDto>>> GetJobs(
            [FromQuery] string? search,
            [FromQuery] int? categoryId,
            [FromQuery] string? type)
        {
            var query = _context.Jobs
                .Include(j => j.Category)
                .Include(j => j.Employer)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(j => j.Title.Contains(search) || j.Description.Contains(search) || j.Location.Contains(search));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(j => j.CategoryId == categoryId);
            }

            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(j => j.Type == type);
            }

            var jobs = await query
                .Select(j => new JobResponseDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    Requirements = j.Requirements,
                    SalaryRange = j.SalaryRange,
                    Location = j.Location,
                    Type = j.Type,
                    PostedDate = j.PostedDate,
                    Deadline = j.Deadline,
                    CategoryId = j.CategoryId,
                    CategoryName = j.Category.Name,
                    EmployerName = j.Employer.FirstName + " " + j.Employer.LastName,
                    IsApproved = j.IsApproved,
                    Status = j.Status,
                    Views = j.Views,
                    ApplicantCount = _context.JobApplications.Count(a => a.JobId == j.Id),
                    RejectionReason = j.RejectionReason
                })
                .ToListAsync();

            return Ok(jobs);
        }

        // GET: api/jobs/{id} - Job details + Applicant count
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<JobResponseDto>> GetJob(int id)
        {
            var job = await _context.Jobs
                .Include(j => j.Category)
                .Include(j => j.Employer)
                .FirstOrDefaultAsync(j => j.Id == id);

            if (job == null)
                return NotFound();

            // Increment view count
            job.Views++;
            await _context.SaveChangesAsync();

            var jobDto = new JobResponseDto
            {
                Id = job.Id,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                SalaryRange = job.SalaryRange,
                Location = job.Location,
                Type = job.Type,
                PostedDate = job.PostedDate,
                Deadline = job.Deadline,
                CategoryId = job.CategoryId,
                CategoryName = job.Category.Name,
                EmployerName = job.Employer.FirstName + " " + job.Employer.LastName,
                IsApproved = job.IsApproved,
                Status = job.Status,
                Views = job.Views,
                ApplicantCount = await _context.JobApplications.CountAsync(a => a.JobId == id),
                RejectionReason = job.RejectionReason
            };

            return Ok(jobDto);
        }

        // GET: api/jobs/employer - Get employer's own jobs
        [HttpGet("employer")]
        [Authorize(Roles = "Employer")]
        public async Task<ActionResult<IEnumerable<JobResponseDto>>> GetEmployerJobs()
        {
            var userId = User.FindFirstValue("UserId");
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var jobs = await _context.Jobs
                .Where(j => j.EmployerId == userId)
                .Include(j => j.Category)
                .Include(j => j.Employer)
                .Select(j => new JobResponseDto
                {
                    Id = j.Id,
                    Title = j.Title,
                    Description = j.Description,
                    Requirements = j.Requirements,
                    SalaryRange = j.SalaryRange,
                    Location = j.Location,
                    Type = j.Type,
                    PostedDate = j.PostedDate,
                    Deadline = j.Deadline,
                    CategoryId = j.CategoryId,
                    CategoryName = j.Category.Name,
                    EmployerName = j.Employer.FirstName + " " + j.Employer.LastName,
                    IsApproved = j.IsApproved,
                    Status = j.Status,
                    Views = j.Views,
                    ApplicantCount = _context.JobApplications.Count(a => a.JobId == j.Id),
                    RejectionReason = j.RejectionReason
                })
                .ToListAsync();

            return Ok(jobs);
        }

        // POST: api/jobs - Create Job (Employer)
        [HttpPost]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Create)]
        public async Task<ActionResult<Job>> CreateJob([FromBody] JobDto jobDto)
        {
            var userId = User.FindFirstValue("UserId");

            if (jobDto.Deadline.Date <= DateTime.Now.Date)
            {
                return BadRequest("Deadline must be a future date.");
            }

            var job = new Job
            {
                Title = jobDto.Title,
                Description = jobDto.Description,
                Requirements = jobDto.Requirements,
                SalaryRange = jobDto.SalaryRange,
                Location = jobDto.Location,
                Type = jobDto.Type,
                Deadline = jobDto.Deadline,
                CategoryId = jobDto.CategoryId,
                EmployerId = userId
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveJobUpdate", "New Job Created");

            return CreatedAtAction(nameof(GetJob), new { id = job.Id }, job);
        }

        // PUT: api/jobs/{id} - Update Job (Employer)
        [HttpPut("{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Edit)]
        public async Task<IActionResult> UpdateJob(int id, [FromBody] JobDto jobDto)
        {
            var userId = User.FindFirstValue("UserId");
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound();

            if (job.EmployerId != userId)
                return Forbid();

            if (jobDto.Deadline.Date <= DateTime.Now.Date)
            {
                return BadRequest("Deadline must be a future date.");
            }

            job.Title = jobDto.Title;
            job.Description = jobDto.Description;
            job.Requirements = jobDto.Requirements;
            job.SalaryRange = jobDto.SalaryRange;
            job.Location = jobDto.Location;
            job.Type = jobDto.Type;
            job.Deadline = jobDto.Deadline;
            job.CategoryId = jobDto.CategoryId;

            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveJobUpdate", "Job Updated");

            return NoContent();
        }

        // DELETE: api/jobs/{id} - Delete Job (Employer)
        [HttpDelete("{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Delete)]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var userId = User.FindFirstValue("UserId");
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound();

            if (job.EmployerId != userId)
                return Forbid();

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveJobUpdate", "Job Deleted");

            return NoContent();
        }

        // PUT: api/jobs/{id}/approve - Approve Job (Admin)
        [HttpPut("{id}/approve")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Approve)]
        public async Task<IActionResult> ApproveJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound();

            job.IsApproved = true;
            await _context.SaveChangesAsync();
            await _hubContext.Clients.All.SendAsync("ReceiveJobUpdate", "Job Approved");

            return Ok(new { message = "Job approved successfully" });
        }

        // PUT: api/jobs/{id}/reject - Reject Job (Admin)
        [HttpPut("{id}/reject")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Approve)]
        public async Task<IActionResult> RejectJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound();

            job.Status = "Closed";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job rejected successfully" });
        }
    }
}
