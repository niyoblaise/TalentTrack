using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace TalentTrack2.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("UserId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst("UserId")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Send notification to specific user
        public async Task SendNotificationToUser(string userId, object notification)
        {
            await Clients.Group(userId).SendAsync("ReceiveNotification", notification);
        }

        // Send stats update to specific user
        public async Task SendStatsUpdate(string userId, object stats)
        {
            await Clients.Group(userId).SendAsync("ReceiveStatsUpdate", stats);
        }

        // Broadcast to all users
        public async Task BroadcastNotification(object notification)
        {
            await Clients.All.SendAsync("ReceiveNotification", notification);
        }

        // Send to specific role
        public async Task SendToRole(string role, object notification)
        {
            await Clients.Group(role).SendAsync("ReceiveNotification", notification);
        }
    }
}
