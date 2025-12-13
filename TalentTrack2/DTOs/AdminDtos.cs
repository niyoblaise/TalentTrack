namespace TalentTrack2.DTOs
{
    // Admin Stats
    public class AdminStatsDto
    {
        public int TotalUsers { get; set; }
        public int TotalEmployers { get; set; }
        public int TotalEmployees { get; set; }
        public int TotalAdmins { get; set; }
        public int TotalJobs { get; set; }
        public int ApprovedJobs { get; set; }
        public int PendingJobs { get; set; }
        public int RejectedJobs { get; set; }
        public int TotalApplications { get; set; }
        public int ActiveUsers { get; set; }
        public int DeactivatedUsers { get; set; }

        public List<ChartDataPoint> UserGrowth { get; set; } = new();
        public List<ChartDataPoint> ApplicationTrends { get; set; } = new();
        public List<ChartDataPoint> JobCategories { get; set; } = new();
        public List<ChartDataPoint> JobsPostedOverTime { get; set; } = new();
    }



    // User Management
    public class UserResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime? DeactivatedUntil { get; set; }
        public string? DeactivationReason { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class UpdateUserDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class DeactivateUserDto
    {
        public int Days { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    // Job Approval
    public class ApproveJobDto
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }

    // Global Notifications
    public class BroadcastNotificationDto
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? TargetRole { get; set; } // null = all users, or "Employer", "Employee"
    }
}
