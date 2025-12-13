using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentTrack2.Data;
using TalentTrack2.DTOs;
using TalentTrack2.Models;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InterviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InterviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/interviews - Schedule interview (Employer)
        [HttpPost]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Interviews.Schedule)]
        public async Task<ActionResult<Interview>> ScheduleInterview([FromBody] InterviewDto interviewDto)
        {
            // Validate future date
            if (interviewDto.ScheduledDate <= DateTime.UtcNow)
                return BadRequest(new { message = "Interview date must be in the future" });

            var userId = User.FindFirstValue("UserId");

            // Verify application and job ownership
            var application = await _context.JobApplications
                .Include(a => a.Job)
                .Include(a => a.Employee)
                .FirstOrDefaultAsync(a => a.Id == interviewDto.ApplicationId);

            if (application == null)
                return NotFound();

            if (application.Job.EmployerId != userId)
                return Forbid();

            var interview = new Interview
            {
                ApplicationId = interviewDto.ApplicationId,
                EmployerId = userId,
                ScheduledDate = interviewDto.ScheduledDate,
                MeetingLink = interviewDto.MeetingLink,
                Location = interviewDto.Location
            };

            _context.Interviews.Add(interview);

            // Update application status
            application.CurrentStatus = "Interview";

            // Add to history
            var history = new ApplicationHistory
            {
                ApplicationId = interviewDto.ApplicationId,
                Status = "Interview",
                Notes = $"Interview scheduled for {interviewDto.ScheduledDate}"
            };
            _context.ApplicationHistories.Add(history);

            // Create notification for employee
            var notification = new Notification
            {
                RecipientId = application.EmployeeId,
                Title = "Interview Scheduled",
                Message = $"An interview has been scheduled for {application.Job.Title} on {interviewDto.ScheduledDate}",
                Type = "Interview"
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetInterview), new { id = interview.Id }, interview);
        }

        // GET: api/interviews/my-interviews - List interviews (Employer/Employee)
        [HttpGet("my-interviews")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Interviews.View)]
        public async Task<ActionResult<IEnumerable<InterviewResponseDto>>> GetMyInterviews()
        {
            var userId = User.FindFirstValue("UserId");
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            IQueryable<Interview> query = _context.Interviews
                .Include(i => i.Application)
                    .ThenInclude(a => a.Job)
                .Include(i => i.Application)
                    .ThenInclude(a => a.Employee);

            if (userRole == "Employer")
                query = query.Where(i => i.EmployerId == userId);
            else if (userRole == "Employee")
                query = query.Where(i => i.Application.EmployeeId == userId);

            var interviews = await query
                .Select(i => new InterviewResponseDto
                {
                    Id = i.Id,
                    ApplicationId = i.ApplicationId,
                    JobTitle = i.Application.Job.Title,
                    CandidateName = i.Application.Employee.FirstName + " " + i.Application.Employee.LastName,
                    ScheduledDate = i.ScheduledDate,
                    MeetingLink = i.MeetingLink,
                    Location = i.Location,
                    Feedback = i.Feedback,
                    IsCompleted = i.IsCompleted
                })
                .ToListAsync();

            return Ok(interviews);
        }

        // GET: api/interviews/{id}
        [HttpGet("{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Interviews.View)]
        public async Task<ActionResult<InterviewResponseDto>> GetInterview(int id)
        {
            var interview = await _context.Interviews
                .Include(i => i.Application)
                    .ThenInclude(a => a.Job)
                .Include(i => i.Application)
                    .ThenInclude(a => a.Employee)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (interview == null)
                return NotFound();

            var interviewDto = new InterviewResponseDto
            {
                Id = interview.Id,
                ApplicationId = interview.ApplicationId,
                JobTitle = interview.Application.Job.Title,
                CandidateName = interview.Application.Employee.FirstName + " " + interview.Application.Employee.LastName,
                ScheduledDate = interview.ScheduledDate,
                MeetingLink = interview.MeetingLink,
                Location = interview.Location,
                Feedback = interview.Feedback,
                IsCompleted = interview.IsCompleted
            };

            return Ok(interviewDto);
        }

        // PUT: api/interviews/{id} - Update details (Employer)
        [HttpPut("{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Interviews.Edit)]
        public async Task<IActionResult> UpdateInterview(int id, [FromBody] InterviewDto interviewDto)
        {
            // Validate future date
            if (interviewDto.ScheduledDate <= DateTime.UtcNow)
                return BadRequest(new { message = "Interview date must be in the future" });

            var userId = User.FindFirstValue("UserId");
            var interview = await _context.Interviews.FindAsync(id);

            if (interview == null)
                return NotFound();

            if (interview.EmployerId != userId)
                return Forbid();

            interview.ScheduledDate = interviewDto.ScheduledDate;
            interview.MeetingLink = interviewDto.MeetingLink;
            interview.Location = interviewDto.Location;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/interviews/{id} - Cancel interview
        [HttpDelete("{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Interviews.Cancel)]
        public async Task<IActionResult> CancelInterview(int id)
        {
            var userId = User.FindFirstValue("UserId");
            var interview = await _context.Interviews.FindAsync(id);

            if (interview == null)
                return NotFound();

            if (interview.EmployerId != userId)
                return Forbid();

            _context.Interviews.Remove(interview);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
