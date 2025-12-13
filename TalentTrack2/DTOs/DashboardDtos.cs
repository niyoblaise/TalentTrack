namespace TalentTrack2.DTOs
{
    public class ChartDataPoint
    {
        public string Name { get; set; }
        public int Value { get; set; }
    }

    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int DeactivatedUsers { get; set; }
        public int TotalEmployers { get; set; }
        public int TotalEmployees { get; set; }
        public int TotalAdmins { get; set; }
        public int TotalJobs { get; set; }
        public int ApprovedJobs { get; set; }
        public int PendingJobs { get; set; }
        public int TotalApplications { get; set; }
        
        // Chart Data
        public List<ChartDataPoint> UserGrowth { get; set; }
        public List<ChartDataPoint> JobCategories { get; set; }
        public List<ChartDataPoint> ApplicationTrends { get; set; }
    }

    public class EmployerDashboardDto
    {
        public int TotalJobs { get; set; }
        public int ApprovedJobs { get; set; }
        public int PendingJobs { get; set; }
        public int TotalApplicationsReceived { get; set; }
        public int HiredCount { get; set; }
        public int RejectedCount { get; set; }
        public int TotalJobViews { get; set; }

        // Chart Data
        public List<ChartDataPoint> ApplicationsOverTime { get; set; }
        public List<ChartDataPoint> ApplicantStatusDistribution { get; set; }
        
        // Recent Activity
        public List<RecentActivityDto> RecentActivity { get; set; } = new();
    }

    public class RecentActivityDto
    {
        public int Id { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Type { get; set; } = string.Empty; // "Application", "JobPosted"
    }

    public class EmployeeDashboardDto
    {
        public int TotalApplications { get; set; }
        public int PendingApplications { get; set; }
        public int ScreeningCount { get; set; }
        public int InterviewScheduled { get; set; }
        public int HiredCount { get; set; }
        public int RejectedCount { get; set; }
        public double RejectionPercentage { get; set; }
        public double HirePercentage { get; set; }

        // Chart Data
        public List<ChartDataPoint> ApplicationStatusDistribution { get; set; }
    }
}
