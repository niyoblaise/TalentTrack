using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentTrack2.Data;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public NotificationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/notifications
        [HttpGet]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Notifications.Access)]
        public async Task<ActionResult> GetMyNotifications()
        {
            var userId = User.FindFirstValue("UserId");

            var notifications = await _context.Notifications
                .Where(n => n.RecipientId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Notifications.Access)]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = User.FindFirstValue("UserId");
            var notification = await _context.Notifications.FindAsync(id);

            if (notification == null)
                return NotFound();

            if (notification.RecipientId != userId)
                return Forbid();

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Notification marked as read" });
        }

        // GET: api/notifications/unread-count
        [HttpGet("unread-count")]
        [Authorize(Policy = TalentTrack2.Authorization.Permissions.Notifications.Access)]
        public async Task<ActionResult> GetUnreadCount()
        {
            var userId = User.FindFirstValue("UserId");

            var count = await _context.Notifications
                .CountAsync(n => n.RecipientId == userId && !n.IsRead);

            return Ok(new { unreadCount = count });
        }
    }
}
