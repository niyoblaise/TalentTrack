using System.ComponentModel.DataAnnotations;

namespace TalentTrack2.DTOs
{
    public class JobApplicationDto
    {
        [Required]
        public int JobId { get; set; }
        [Required]
        public string CvUrl { get; set; }
        public string CoverLetter { get; set; }
    }

    public class ApplicationResponseDto
    {
        public int Id { get; set; }
        public int JobId { get; set; }
        public string JobTitle { get; set; }
        public string EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeeEmail { get; set; }
        public DateTime AppliedDate { get; set; }
        public string CvUrl { get; set; }
        public string CoverLetter { get; set; }
        public string CurrentStatus { get; set; }
        public string RejectionReason { get; set; }
        public int MatchScore { get; set; }
        public DateTime? InterviewDate { get; set; }
    }

    public class UpdateApplicationStatusDto
    {
        [Required]
        public string Status { get; set; } // Screening, Interview, Hired, Rejected
        public string? RejectionReason { get; set; }
    }

    public class InterviewDto
    {
        [Required]
        public int ApplicationId { get; set; }
        [Required]
        public DateTime ScheduledDate { get; set; }
        public string MeetingLink { get; set; }
        public string Location { get; set; }
    }

    public class InterviewResponseDto
    {
        public int Id { get; set; }
        public int ApplicationId { get; set; }
        public string JobTitle { get; set; }
        public string CandidateName { get; set; }
        public DateTime ScheduledDate { get; set; }
        public string MeetingLink { get; set; }
        public string Location { get; set; }
        public string Feedback { get; set; }
        public bool IsCompleted { get; set; }
    }
}
