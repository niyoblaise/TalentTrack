using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Security.Claims;
using TalentTrack2.Data;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin,Employer,Employee")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.MinValue;
            var end = endDate ?? DateTime.MaxValue;
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isEmployer = User.IsInRole("Employer");
            var isEmployee = User.IsInRole("Employee");

            var jobsQuery = _context.Jobs.AsQueryable();
            var applicationsQuery = _context.JobApplications.AsQueryable();

            if (isEmployer)
            {
                jobsQuery = jobsQuery.Where(j => j.EmployerId == userId);
                applicationsQuery = applicationsQuery.Where(a => a.Job.EmployerId == userId);
            }
            else if (isEmployee)
            {
                // Employees don't manage jobs, so we can return empty or jobs they applied to?
                // For now, let's return empty for jobs to avoid confusion, or maybe all jobs?
                // Let's return empty for jobs for now as the chart is "Job Status Distribution" which implies ownership.
                jobsQuery = jobsQuery.Where(j => false); 
                applicationsQuery = applicationsQuery.Where(a => a.EmployeeId == userId);
            }

            var jobStats = await jobsQuery
                .Where(j => j.PostedDate >= start && j.PostedDate <= end)
                .GroupBy(j => j.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            var applicationStats = await applicationsQuery
                .Where(a => a.AppliedDate >= start && a.AppliedDate <= end)
                .GroupBy(a => a.CurrentStatus)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(new { Jobs = jobStats, Applications = applicationStats });
        }

        [HttpGet("export/applications")]
        public async Task<IActionResult> ExportApplications([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.MinValue;
            var end = endDate ?? DateTime.MaxValue;
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isEmployer = User.IsInRole("Employer");
            var isEmployee = User.IsInRole("Employee");

            var applicationsQuery = _context.JobApplications
                .Include(a => a.Job)
                .Include(a => a.Employee)
                .AsQueryable();

            if (isEmployer)
            {
                applicationsQuery = applicationsQuery.Where(a => a.Job.EmployerId == userId);
            }
            else if (isEmployee)
            {
                applicationsQuery = applicationsQuery.Where(a => a.EmployeeId == userId);
            }

            var applications = await applicationsQuery
                .Where(a => a.AppliedDate >= start && a.AppliedDate <= end)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("ApplicationId,JobTitle,ApplicantName,Status,AppliedDate");

            foreach (var app in applications)
            {
                csv.AppendLine($"{app.Id},{EscapeCsv(app.Job.Title)},{EscapeCsv(app.Employee.FirstName + " " + app.Employee.LastName)},{app.CurrentStatus},{app.AppliedDate}");
            }

            return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "applications_report.csv");
        }

        private string EscapeCsv(string field)
        {
            if (string.IsNullOrEmpty(field)) return "";
            if (field.Contains(",") || field.Contains("\"") || field.Contains("\n"))
            {
                return $"\"{field.Replace("\"", "\"\"")}\"";
            }
            return field;
        }
    }
}
