using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TalentTrack2.Data;
using TalentTrack2.Hubs;
using TalentTrack2.Models;

namespace TalentTrack2.Services
{
    public class InterviewReminderService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<InterviewReminderService> _logger;

        public InterviewReminderService(
            IServiceProvider serviceProvider,
            IHubContext<NotificationHub> hubContext,
            ILogger<InterviewReminderService> logger)
        {
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Interview Reminder Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndSendReminders();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while sending interview reminders.");
                }

                // Check every minute
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task CheckAndSendReminders()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                var now = DateTime.UtcNow;
                var reminderTimeStart = now.AddMinutes(29);
                var reminderTimeEnd = now.AddMinutes(31);

                // Find interviews starting in ~30 minutes
                var upcomingInterviews = await context.Interviews
                    .Include(i => i.Application)
                        .ThenInclude(a => a.Job)
                    .Where(i => i.ScheduledDate >= reminderTimeStart && 
                                i.ScheduledDate <= reminderTimeEnd &&
                                !i.IsCompleted)
                    .ToListAsync();

                foreach (var interview in upcomingInterviews)
                {
                    // Check if we already sent a reminder (optional optimization, but for now we rely on the narrow time window)
                    // Ideally we would have a flag on the interview or a separate table, but the 2-minute window with 1-minute interval 
                    // might cause duplicates if we are not careful. 
                    // To be safe, let's assume the window is tight enough or we accept a potential double notification in rare cases.
                    // A better approach is to check if a notification already exists for this event type recently.

                    // Check for existing notification to avoid duplicates
                    bool reminderExists = await context.Notifications.AnyAsync(n => 
                        n.Type == "InterviewReminder" && 
                        n.Message.Contains(interview.Application.Job.Title) &&
                        n.CreatedAt > now.AddMinutes(-5)); // Check if sent in last 5 mins

                    if (reminderExists) continue;

                    await SendReminder(context, interview.Application.EmployeeId, interview, "Employee");
                    await SendReminder(context, interview.EmployerId, interview, "Employer");
                }

                if (upcomingInterviews.Any())
                {
                    await context.SaveChangesAsync();
                }
            }
        }

        private async Task SendReminder(ApplicationDbContext context, string userId, Interview interview, string role)
        {
            var title = "Upcoming Interview Reminder";
            var message = $"You have an interview for {interview.Application.Job.Title} starting in 30 minutes.";

            var notification = new Notification
            {
                RecipientId = userId,
                Title = title,
                Message = message,
                Type = "InterviewReminder",
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            context.Notifications.Add(notification);

            // Send real-time update
            await _hubContext.Clients.Group(userId).SendAsync("ReceiveNotification", notification);
        }
    }
}
