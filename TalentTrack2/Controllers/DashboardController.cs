using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
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
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public DashboardController(ApplicationDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        // GET: api/dashboard/admin
        [HttpGet("admin")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Dashboard.ViewAdmin)]
        public async Task<ActionResult<AdminDashboardDto>> GetAdminStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var activeUsers = await _userManager.Users.CountAsync(u => u.IsActive);
            var deactivatedUsers = await _userManager.Users.CountAsync(u => !u.IsActive);

            // Get users by role (this is a bit more complex with Identity, doing a simplified version)
            // In a real app, you'd join with UserRoles table
            var allUsers = await _userManager.Users.ToListAsync();
            var totalEmployers = 0;
            var totalEmployees = 0;
            var totalAdmins = 0;

            foreach (var user in allUsers)
            {
                if (await _userManager.IsInRoleAsync(user, "Employer")) totalEmployers++;
                else if (await _userManager.IsInRoleAsync(user, "Employee")) totalEmployees++;
                else if (await _userManager.IsInRoleAsync(user, "Admin")) totalAdmins++;
            }

            var totalJobs = await _context.Jobs.CountAsync();
            var approvedJobs = await _context.Jobs.CountAsync(j => j.IsApproved);
            var pendingJobs = await _context.Jobs.CountAsync(j => !j.IsApproved);
            var totalApplications = await _context.JobApplications.CountAsync();

            // Chart Data: User Growth (Last 6 Months)
            var userGrowth = new List<ChartDataPoint>();
            var today = DateTime.UtcNow;
            for (int i = 5; i >= 0; i--)
            {
                var month = today.AddMonths(-i);
                var count = await _userManager.Users
                    .CountAsync(u => u.CreatedDate.Month == month.Month && u.CreatedDate.Year == month.Year);
                
                userGrowth.Add(new ChartDataPoint 
                { 
                    Name = month.ToString("MMM"), 
                    Value = count 
                });
            }

            // Chart Data: Jobs by Category
            var jobCategories = await _context.Jobs
                .GroupBy(j => j.Category.Name)
                .Select(g => new ChartDataPoint
                {
                    Name = g.Key,
                    Value = g.Count()
                })
                .ToListAsync();

            // Chart Data: Application Trends (Last 6 Months)
            var applicationTrends = new List<ChartDataPoint>();
            for (int i = 5; i >= 0; i--)
            {
                var month = today.AddMonths(-i);
                var count = await _context.JobApplications
                    .CountAsync(a => a.AppliedDate.Month == month.Month && a.AppliedDate.Year == month.Year);

                applicationTrends.Add(new ChartDataPoint
                {
                    Name = month.ToString("MMM"),
                    Value = count
                });
            }

            var stats = new AdminDashboardDto
            {
                TotalUsers = totalUsers,
                ActiveUsers = activeUsers,
                DeactivatedUsers = deactivatedUsers,
                TotalEmployers = totalEmployers,
                TotalEmployees = totalEmployees,
                TotalAdmins = totalAdmins,
                TotalJobs = totalJobs,
                ApprovedJobs = approvedJobs,
                PendingJobs = pendingJobs,
                TotalApplications = totalApplications,
                UserGrowth = userGrowth,
                JobCategories = jobCategories,
                ApplicationTrends = applicationTrends
            };

            return Ok(stats);
        }

        // GET: api/dashboard/employer
        [HttpGet("employer")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Dashboard.ViewEmployer)]
        public async Task<ActionResult<EmployerDashboardDto>> GetEmployerStats()
        {
            var userId = User.FindFirstValue("UserId");

            var totalJobs = await _context.Jobs.CountAsync(j => j.EmployerId == userId);
            var approvedJobs = await _context.Jobs.CountAsync(j => j.EmployerId == userId && j.IsApproved);
            var pendingJobs = await _context.Jobs.CountAsync(j => j.EmployerId == userId && !j.IsApproved);

            var jobIds = await _context.Jobs
                .Where(j => j.EmployerId == userId)
                .Select(j => j.Id)
                .ToListAsync();

            var totalApplications = await _context.JobApplications
                .CountAsync(a => jobIds.Contains(a.JobId));

            var hiredCount = await _context.JobApplications
                .CountAsync(a => jobIds.Contains(a.JobId) && a.CurrentStatus == "Hired");

            var rejectedCount = await _context.JobApplications
                .CountAsync(a => jobIds.Contains(a.JobId) && a.CurrentStatus == "Rejected");

            var totalViews = await _context.Jobs
                .Where(j => j.EmployerId == userId)
                .SumAsync(j => j.Views);

            // Chart Data: Applications Over Time (Last 6 Months)
            var applicationsOverTime = new List<ChartDataPoint>();
            var today = DateTime.UtcNow;
            for (int i = 5; i >= 0; i--)
            {
                var month = today.AddMonths(-i);
                var count = await _context.JobApplications
                    .CountAsync(a => jobIds.Contains(a.JobId) && a.AppliedDate.Month == month.Month && a.AppliedDate.Year == month.Year);

                applicationsOverTime.Add(new ChartDataPoint
                {
                    Name = month.ToString("MMM"),
                    Value = count
                });
            }

            // Chart Data: Applicant Status Distribution
            var statusDistribution = await _context.JobApplications
                .Where(a => jobIds.Contains(a.JobId))
                .GroupBy(a => a.CurrentStatus)
                .Select(g => new ChartDataPoint
                {
                    Name = g.Key,
                    Value = g.Count()
                })
                .ToListAsync();

            // Recent Activity (Last 5 Applications)
            var recentActivity = await _context.JobApplications
                .Include(a => a.Job)
                .Include(a => a.Employee)
                .Where(a => jobIds.Contains(a.JobId))
                .OrderByDescending(a => a.AppliedDate)
                .Take(5)
                .Select(a => new RecentActivityDto
                {
                    Id = a.Id,
                    Description = $"{a.Employee.FirstName} {a.Employee.LastName} applied for {a.Job.Title}",
                    Date = a.AppliedDate,
                    Type = "Application"
                })
                .ToListAsync();

            var stats = new EmployerDashboardDto
            {
                TotalJobs = totalJobs,
                ApprovedJobs = approvedJobs,
                PendingJobs = pendingJobs,
                TotalApplicationsReceived = totalApplications,
                HiredCount = hiredCount,
                RejectedCount = rejectedCount,
                TotalJobViews = totalViews,
                ApplicationsOverTime = applicationsOverTime,
                ApplicantStatusDistribution = statusDistribution,
                RecentActivity = recentActivity
            };

            return Ok(stats);
        }

        [HttpGet("employee")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Dashboard.ViewEmployee)]
        public async Task<ActionResult<EmployeeDashboardDto>> GetEmployeeStats()
        {
            var userId = User.FindFirstValue("UserId");

            var totalApplications = await _context.JobApplications
                .CountAsync(a => a.EmployeeId == userId);

            var pendingApplications = await _context.JobApplications
                .CountAsync(a => a.EmployeeId == userId && a.CurrentStatus == "Pending");

            var screeningCount = await _context.JobApplications
                .CountAsync(a => a.EmployeeId == userId && a.CurrentStatus == "Screening");

            var interviewCount = await _context.JobApplications
                .CountAsync(a => a.EmployeeId == userId && a.CurrentStatus == "Interview");

            var hiredCount = await _context.JobApplications
                .CountAsync(a => a.EmployeeId == userId && a.CurrentStatus == "Hired");

            var rejectedCount = await _context.JobApplications
                .CountAsync(a => a.EmployeeId == userId && a.CurrentStatus == "Rejected");

            var rejectionPercentage = totalApplications > 0 
                ? (double)rejectedCount / totalApplications * 100 
                : 0;

            var hirePercentage = totalApplications > 0 
                ? (double)hiredCount / totalApplications * 100 
                : 0;

            // Chart Data: Application Status Distribution
            var statusDistribution = await _context.JobApplications
                .Where(a => a.EmployeeId == userId)
                .GroupBy(a => a.CurrentStatus)
                .Select(g => new ChartDataPoint
                {
                    Name = g.Key,
                    Value = g.Count()
                })
                .ToListAsync();

            var stats = new EmployeeDashboardDto
            {
                TotalApplications = totalApplications,
                PendingApplications = pendingApplications,
                ScreeningCount = screeningCount,
                InterviewScheduled = interviewCount,
                HiredCount = hiredCount,
                RejectedCount = rejectedCount,
                RejectionPercentage = Math.Round(rejectionPercentage, 2),
                HirePercentage = Math.Round(hirePercentage, 2),
                ApplicationStatusDistribution = statusDistribution
            };

            return Ok(stats);
        }
    }
}
