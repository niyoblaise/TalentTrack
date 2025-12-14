using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentTrack2.Data;
using TalentTrack2.DTOs;
using TalentTrack2.Models;
using TalentTrack2.Services;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ApplicationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEncryptionService _encryptionService;
        private readonly IVettingService _vettingService;

        public ApplicationsController(ApplicationDbContext context, IEncryptionService encryptionService, IVettingService vettingService)
        {
            _context = context;
            _encryptionService = encryptionService;
            _vettingService = vettingService;
        }

        // POST: api/applications/apply - Apply for job (Employee)
        [HttpPost("apply")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.Create)]
        [ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger to avoid IFormFile error
        public async Task<ActionResult<JobApplication>> ApplyForJob([FromForm] IFormFile cv, [FromForm] int jobId, [FromForm] string? coverLetter)
        {
            var userId = User.FindFirstValue("UserId");

            // Check if already applied
            var existingApplication = await _context.JobApplications
                .FirstOrDefaultAsync(a => a.JobId == jobId && a.EmployeeId == userId);

            if (existingApplication != null)
                return BadRequest(new { message = "You have already applied for this job" });

            if (cv == null || cv.Length == 0)
                return BadRequest(new { message = "CV file is required" });

            // Get Job Requirements for Vetting
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null)
                return NotFound(new { message = "Job not found" });

            // Save CV file
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "cvs");
            Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = $"{userId}_{jobId}_{Guid.NewGuid()}{Path.GetExtension(cv.FileName)}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await cv.CopyToAsync(stream);
            }

            // Encrypt CV path
            var encryptedCv = _encryptionService.Encrypt(filePath);

            // Auto-Vetting: Calculate Match Score
            int matchScore = _vettingService.CalculateMatchScore(job.Requirements, coverLetter ?? "");
            string status = "Pending";
            string? rejectionReason = null;

            // Optional: Auto-Reject if score is very low (e.g., < 10%)
            // if (matchScore < 10) 
            // {
            //     status = "Rejected";
            //     rejectionReason = "Auto-rejected: Low requirement match score";
            // }

            var application = new JobApplication
            {
                JobId = jobId,
                EmployeeId = userId,
                CvUrl = encryptedCv,
                CoverLetter = coverLetter ?? string.Empty,
                MatchScore = matchScore,
                CurrentStatus = status,
                RejectionReason = rejectionReason
            };

            _context.JobApplications.Add(application);

            // Create initial history entry
            var history = new ApplicationHistory
            {
                Application = application, // Use navigation property to let EF Core handle the ID
                Status = status,
                Notes = $"Application submitted. Auto-Vetting Score: {matchScore}%"
            };
            _context.ApplicationHistories.Add(history);

            await _context.SaveChangesAsync();

            // Create notification for employer
            var notification = new Notification
            {
                RecipientId = job.EmployerId,
                Title = "New Application",
                Message = $"You have a new application for {job.Title} (Match: {matchScore}%)",
                Type = "ApplicationUpdate"
            };
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApplication), new { id = application.Id }, application);
        }

        // GET: api/applications/my-applications - List my applications (Employee)
        [HttpGet("my-applications")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.ViewMy)]
        public async Task<ActionResult<IEnumerable<ApplicationResponseDto>>> GetMyApplications([FromQuery] string? search)
        {
            var userId = User.FindFirstValue("UserId");

            var query = _context.JobApplications
                .Where(a => a.EmployeeId == userId && a.CurrentStatus != "Withdrawn")
                .Include(a => a.Job)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Job.Title.Contains(search) || a.Job.Employer.FirstName.Contains(search) || a.Job.Employer.LastName.Contains(search));
            }

            var applications = await query
                .Select(a => new ApplicationResponseDto
                {
                    Id = a.Id,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    AppliedDate = a.AppliedDate,
                    CurrentStatus = a.CurrentStatus,
                    RejectionReason = a.RejectionReason,
                    InterviewDate = _context.Interviews
                        .Where(i => i.ApplicationId == a.Id)
                        .Select(i => (DateTime?)i.ScheduledDate)
                        .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(applications);
        }

        // PUT: api/applications/{id}/withdraw - Withdraw application (Employee)
        [HttpPut("{id}/withdraw")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.Withdraw)]
        public async Task<IActionResult> WithdrawApplication(int id)
        {
            var userId = User.FindFirstValue("UserId");
            var application = await _context.JobApplications
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound(new { message = "Application not found" });

            if (application.EmployeeId != userId)
                return Forbid();

            if (application.CurrentStatus.Equals("Hired", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Cannot withdraw an application that has been hired." });

            application.CurrentStatus = "Withdrawn";

            // Add to history
            var history = new ApplicationHistory
            {
                ApplicationId = id,
                Status = "Withdrawn",
                Notes = "Application withdrawn by candidate"
            };
            _context.ApplicationHistories.Add(history);

            // Notify employer
            var notification = new Notification
            {
                RecipientId = application.Job.EmployerId,
                Title = "Application Withdrawn",
                Message = $"Candidate has withdrawn their application for {application.Job.Title}",
                Type = "ApplicationUpdate"
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application withdrawn successfully" });
        }

        // GET: api/applications/job/{jobId} - List applicants for a job (Employer)
        [HttpGet("job/{jobId}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.ViewJobApplications)]
        public async Task<ActionResult<IEnumerable<ApplicationResponseDto>>> GetJobApplications(int jobId, [FromQuery] string? search)
        {
            var userId = User.FindFirstValue("UserId");

            // Verify job ownership
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null || job.EmployerId != userId)
                return Forbid();

            var query = _context.JobApplications
                .Where(a => a.JobId == jobId)
                .Include(a => a.Employee)
                .Include(a => a.Job)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Employee.FirstName.Contains(search) || a.Employee.LastName.Contains(search) || a.Employee.Email.Contains(search));
            }

            var applications = await query
                .Select(a => new ApplicationResponseDto
                {
                    Id = a.Id,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                    EmployeeEmail = a.Employee.Email,
                    AppliedDate = a.AppliedDate,
                    CoverLetter = a.CoverLetter,
                    CurrentStatus = a.CurrentStatus,
                    RejectionReason = a.RejectionReason,
                    MatchScore = a.MatchScore
                })
                .ToListAsync();

            return Ok(applications);
        }

        // GET: api/applications/employer/all - List all applicants for employer
        [HttpGet("employer/all")]
        [Authorize(Roles = "Employer")]
        public async Task<ActionResult<IEnumerable<ApplicationResponseDto>>> GetAllApplications([FromQuery] string? search)
        {
            var userId = User.FindFirstValue("UserId");

            var query = _context.JobApplications
                .Where(a => a.Job.EmployerId == userId)
                .Include(a => a.Employee)
                .Include(a => a.Job)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(a => a.Employee.FirstName.Contains(search) || a.Employee.LastName.Contains(search) || a.Job.Title.Contains(search));
            }

            var applications = await query
                .Select(a => new ApplicationResponseDto
                {
                    Id = a.Id,
                    JobId = a.JobId,
                    JobTitle = a.Job.Title,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = a.Employee.FirstName + " " + a.Employee.LastName,
                    EmployeeEmail = a.Employee.Email,
                    AppliedDate = a.AppliedDate,
                    CoverLetter = a.CoverLetter,
                    CurrentStatus = a.CurrentStatus,
                    RejectionReason = a.RejectionReason,
                    MatchScore = a.MatchScore
                })
                .ToListAsync();

            return Ok(applications);
        }

        [HttpGet("{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.ViewDetail)]
        public async Task<ActionResult<ApplicationResponseDto>> GetApplication(int id)
        {
            var application = await _context.JobApplications
                .Include(a => a.Employee)
                .Include(a => a.Job)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound();

            var userId = User.FindFirstValue("UserId");
            if (application.Job.EmployerId != userId)
                return Forbid();

            // Decrypt CV
            var decryptedCv = _encryptionService.Decrypt(application.CvUrl);

            var applicationDto = new ApplicationResponseDto
            {
                Id = application.Id,
                JobId = application.JobId,
                JobTitle = application.Job.Title,
                EmployeeId = application.EmployeeId,
                EmployeeName = application.Employee.FirstName + " " + application.Employee.LastName,
                EmployeeEmail = application.Employee.Email,
                AppliedDate = application.AppliedDate,
                CvUrl = decryptedCv,
                CoverLetter = application.CoverLetter,
                CurrentStatus = application.CurrentStatus,
                RejectionReason = application.RejectionReason
            };

            return Ok(applicationDto);
        }

        // PUT: api/applications/{id}/status - Change status (Hire/Reject/Screen) (Employer)
        [HttpPut("{id}/status")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.ManageStatus)]
        public async Task<IActionResult> UpdateApplicationStatus(int id, [FromBody] UpdateApplicationStatusDto statusDto)
        {
            var application = await _context.JobApplications
                .Include(a => a.Job)
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (application == null)
                return NotFound();

            var userId = User.FindFirstValue("UserId");
            if (application.Job.EmployerId != userId)
                return Forbid();

            application.CurrentStatus = statusDto.Status;
            if (statusDto.Status == "Rejected")
                application.RejectionReason = statusDto.RejectionReason;

            // Add to history
            var history = new ApplicationHistory
            {
                ApplicationId = id,
                Status = statusDto.Status,
                Notes = statusDto.RejectionReason ?? $"Status changed to {statusDto.Status}"
            };
            _context.ApplicationHistories.Add(history);

            // Create notification for employee
            var notification = new Notification
            {
                RecipientId = application.EmployeeId,
                Title = "Application Update",
                Message = $"Your application for {application.Job.Title} has been updated to {statusDto.Status}",
                Type = "ApplicationUpdate"
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Application status updated successfully" });
        }

        // GET: api/applications/{id}/history - View tracking history (Employee)
        [HttpGet("{id}/history")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Applications.ViewHistory)]
        public async Task<ActionResult<IEnumerable<ApplicationHistory>>> GetApplicationHistory(int id)
        {
            var userId = User.FindFirstValue("UserId");
            var application = await _context.JobApplications.FindAsync(id);

            if (application == null)
                return NotFound();

            if (application.EmployeeId != userId)
                return Forbid();

            var history = await _context.ApplicationHistories
                .Where(h => h.ApplicationId == id)
                .OrderBy(h => h.ChangedDate)
                .ToListAsync();

            return Ok(history);
        }
    }
}
