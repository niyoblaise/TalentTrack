using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TalentTrack2.Data;
using TalentTrack2.DTOs;
using TalentTrack2.Hubs;
using TalentTrack2.Models;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly IHubContext<NotificationHub> _hubContext;

        public AdminController(
            ApplicationDbContext context,
            UserManager<AppUser> userManager,
            IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        // ==================== DASHBOARD STATS ====================

        [HttpGet("stats")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Dashboard.ViewAdmin)]
        public async Task<ActionResult<AdminStatsDto>> GetAdminStats()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            var activeUsers = await _userManager.Users.CountAsync(u => u.IsActive);
            var deactivatedUsers = totalUsers - activeUsers;

            var employers = await _userManager.GetUsersInRoleAsync("Employer");
            var employees = await _userManager.GetUsersInRoleAsync("Employee");
            var admins = await _userManager.GetUsersInRoleAsync("Admin");

            var totalJobs = await _context.Jobs.CountAsync();
            var approvedJobs = await _context.Jobs.CountAsync(j => j.IsApproved);
            var rejectedJobs = await _context.Jobs.CountAsync(j => j.Status == "Rejected");
            var pendingJobs = await _context.Jobs.CountAsync(j => !j.IsApproved && j.Status != "Rejected");

            var totalApplications = await _context.JobApplications.CountAsync();

            // Calculate User Growth (Last 6 Months)
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
            var userGrowth = await _userManager.Users
                .Where(u => u.CreatedDate >= sixMonthsAgo)
                .GroupBy(u => new { u.CreatedDate.Year, u.CreatedDate.Month })
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            var userGrowthData = userGrowth
                .Select(g => new ChartDataPoint
                {
                    Name = new DateTime(g.Date.Year, g.Date.Month, 1).ToString("MMM"),
                    Value = g.Count
                })
                .OrderBy(x => DateTime.ParseExact(x.Name, "MMM", System.Globalization.CultureInfo.InvariantCulture))
                .ToList();

            // Calculate Application Trends (Last 6 Months)
            var applicationTrends = await _context.JobApplications
                .Where(a => a.AppliedDate >= sixMonthsAgo)
                .GroupBy(a => new { a.AppliedDate.Year, a.AppliedDate.Month })
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            var applicationTrendsData = applicationTrends
                .Select(g => new ChartDataPoint
                {
                    Name = new DateTime(g.Date.Year, g.Date.Month, 1).ToString("MMM"),
                    Value = g.Count
                })
                .OrderBy(x => DateTime.ParseExact(x.Name, "MMM", System.Globalization.CultureInfo.InvariantCulture))
                .ToList();

            // Calculate Jobs by Category
            var jobCategories = await _context.Jobs
                .Include(j => j.Category)
                .GroupBy(j => j.Category.Name)
                .Select(g => new ChartDataPoint
                {
                    Name = g.Key,
                    Value = g.Count()
                })
                .ToListAsync();

            // Calculate Jobs Posted Over Time (Last 6 Months)
            var jobsPosted = await _context.Jobs
                .Where(j => j.PostedDate >= sixMonthsAgo)
                .GroupBy(j => new { j.PostedDate.Year, j.PostedDate.Month })
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            var jobsPostedData = jobsPosted
                .Select(g => new ChartDataPoint
                {
                    Name = new DateTime(g.Date.Year, g.Date.Month, 1).ToString("MMM"),
                    Value = g.Count
                })
                .OrderBy(x => DateTime.ParseExact(x.Name, "MMM", System.Globalization.CultureInfo.InvariantCulture))
                .ToList();

            var stats = new AdminStatsDto
            {
                TotalUsers = totalUsers,
                TotalEmployers = employers.Count,
                TotalEmployees = employees.Count,
                TotalAdmins = admins.Count,
                TotalJobs = totalJobs,
                ApprovedJobs = approvedJobs,
                PendingJobs = pendingJobs,
                RejectedJobs = rejectedJobs,
                TotalApplications = totalApplications,
                ActiveUsers = activeUsers,
                DeactivatedUsers = deactivatedUsers,
                UserGrowth = userGrowthData,
                ApplicationTrends = applicationTrendsData,
                JobCategories = jobCategories,
                JobsPostedOverTime = jobsPostedData
            };

            return Ok(stats);
        }

        // ==================== USER MANAGEMENT ====================

        [HttpGet("users")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.View)]
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAllUsers(
            [FromQuery] string? role = null,
            [FromQuery] bool? isActive = null)
        {
            var query = _userManager.Users.AsQueryable();

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var users = await query
                .OrderByDescending(u => u.CreatedDate)
                .ToListAsync();

            var userDtos = new List<UserResponseDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var userRole = roles.FirstOrDefault() ?? "Unknown";

                if (role != null && userRole != role)
                    continue;

                userDtos.Add(new UserResponseDto
                {
                    Id = user.Id,
                    Email = user.Email ?? "",
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = userRole,
                    IsActive = user.IsActive,
                    DeactivatedUntil = user.DeactivatedUntil,
                    DeactivationReason = user.DeactivationReason,
                    CreatedDate = user.CreatedDate
                });
            }

            return Ok(userDtos);
        }

        [HttpGet("users/{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.View)]
        public async Task<ActionResult<UserResponseDto>> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var roles = await _userManager.GetRolesAsync(user);

            var userDto = new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email ?? "",
                FirstName = user.FirstName,
                LastName = user.LastName,
                Role = roles.FirstOrDefault() ?? "Unknown",
                IsActive = user.IsActive,
                DeactivatedUntil = user.DeactivatedUntil,
                DeactivationReason = user.DeactivationReason,
                CreatedDate = user.CreatedDate
            };

            return Ok(userDto);
        }

        [HttpPut("users/{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.Manage)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.FirstName = model.FirstName;
            user.LastName = model.LastName;
            user.Email = model.Email;
            user.UserName = model.Email;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to update user" });

            return Ok(new { message = "User updated successfully" });
        }

        [HttpDelete("users/{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.Manage)]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to delete user" });

            return Ok(new { message = "User deleted successfully" });
        }

        [HttpPut("users/{id}/deactivate")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.Manage)]
        public async Task<IActionResult> DeactivateUser(string id, [FromBody] DeactivateUserDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.IsActive = false;
            user.DeactivatedUntil = DateTime.UtcNow.AddDays(model.Days);
            user.DeactivationReason = model.Reason;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to deactivate user" });

            return Ok(new { message = $"User deactivated for {model.Days} days" });
        }

        [HttpPut("users/{id}/activate")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.Manage)]
        public async Task<IActionResult> ActivateUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            user.IsActive = true;
            user.DeactivatedUntil = null;
            user.DeactivationReason = null;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to activate user" });

            return Ok(new { message = "User activated successfully" });
        }

        [HttpPut("users/{id}/role")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Users.Manage)]
        public async Task<IActionResult> ChangeUserRole(string id, [FromBody] ChangeUserRoleDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            var currentRoles = await _userManager.GetRolesAsync(user);
            var result = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to remove existing roles" });

            result = await _userManager.AddToRoleAsync(user, model.NewRole);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to add new role" });

            return Ok(new { message = $"User role updated to {model.NewRole}" });
        }

        // ==================== JOB MANAGEMENT ====================

        [HttpGet("jobs")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.View)]
        public async Task<ActionResult<IEnumerable<JobResponseDto>>> GetAllJobs([FromQuery] string? status = null)
        {
            var query = _context.Jobs.AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                switch (status.ToLower())
                {
                    case "approved":
                        query = query.Where(j => j.IsApproved);
                        break;
                    case "pending":
                        query = query.Where(j => !j.IsApproved && j.Status != "Rejected");
                        break;
                    case "rejected":
                        query = query.Where(j => j.Status == "Rejected");
                        break;
                    // "all" or null returns everything
                }
            }

            var jobs = await query
                .OrderByDescending(j => j.PostedDate)
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
                    EmployerId = j.EmployerId,
                    EmployerName = j.Employer.FirstName + " " + j.Employer.LastName,
                    IsApproved = j.IsApproved,
                    Status = j.Status,
                    Views = j.Views,
                    RejectionReason = j.RejectionReason
                })
                .ToListAsync();

            return Ok(jobs);
        }

        [HttpPut("jobs/{id}/approve")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Approve)]
        public async Task<IActionResult> ApproveJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound(new { message = "Job not found" });

            job.IsApproved = true;
            job.Status = "Open"; // Ensure status is Open when approved

            // Notify employer
            var notification = new Notification
            {
                RecipientId = job.EmployerId,
                Title = "Job Approved",
                Message = $"Your job posting '{job.Title}' has been approved and is now live!",
                Type = "JobApproval"
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            // Send real-time notification via SignalR
            await _hubContext.Clients.User(job.EmployerId).SendAsync("ReceiveNotification", notification);

            return Ok(new { message = "Job approved successfully" });
        }

        [HttpPut("jobs/{id}/reject")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Approve)]
        public async Task<IActionResult> RejectJob(int id, [FromBody] ApproveJobDto model)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound(new { message = "Job not found" });

            job.IsApproved = false;
            job.Status = "Rejected"; // Explicitly set status to Rejected
            job.RejectionReason = model.RejectionReason;

            // Notify employer
            var notification = new Notification
            {
                RecipientId = job.EmployerId,
                Title = "Job Rejected",
                Message = $"Your job posting '{job.Title}' was not approved. Reason: {model.RejectionReason}",
                Type = "JobRejection"
            };
            _context.Notifications.Add(notification);

            await _context.SaveChangesAsync();

            // Send real-time notification via SignalR
            await _hubContext.Clients.User(job.EmployerId).SendAsync("ReceiveNotification", notification);

            return Ok(new { message = "Job rejected" });
        }

        [HttpDelete("jobs/{id}")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Jobs.Delete)]
        public async Task<IActionResult> DeleteJob(int id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
                return NotFound(new { message = "Job not found" });

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Job deleted successfully" });
        }

        // ==================== GLOBAL NOTIFICATIONS ====================

        [HttpPost("notifications/broadcast")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Notifications.Broadcast)]
        public async Task<IActionResult> BroadcastNotification([FromBody] BroadcastNotificationDto model)
        {
            List<string> targetUserIds;

            if (string.IsNullOrEmpty(model.TargetRole))
            {
                // Send to all users
                targetUserIds = await _userManager.Users
                    .Where(u => u.IsActive)
                    .Select(u => u.Id)
                    .ToListAsync();
            }
            else
            {
                // Send to specific role
                var usersInRole = await _userManager.GetUsersInRoleAsync(model.TargetRole);
                targetUserIds = usersInRole.Where(u => u.IsActive).Select(u => u.Id).ToList();
            }

            // Create notifications for all target users
            var notifications = targetUserIds.Select(userId => new Notification
            {
                RecipientId = userId,
                Title = model.Title,
                Message = model.Message,
                Type = "Broadcast"
            }).ToList();

            _context.Notifications.AddRange(notifications);
            await _context.SaveChangesAsync();

            // Send real-time notifications via SignalR
            foreach (var notification in notifications)
            {
                await _hubContext.Clients.User(notification.RecipientId)
                    .SendAsync("ReceiveNotification", notification);
            }

            return Ok(new { message = $"Notification sent to {targetUserIds.Count} users" });
        }
    }
}
