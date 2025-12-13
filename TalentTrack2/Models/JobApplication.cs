using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentTrack2.Models
{
    public class JobApplication
    {
        public int Id { get; set; }
        
        public int JobId { get; set; }
        [ForeignKey("JobId")]
        public Job Job { get; set; }

        public string EmployeeId { get; set; }
        [ForeignKey("EmployeeId")]
        public AppUser Employee { get; set; }

        public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
        public string CvUrl { get; set; } // Encrypted
        public string CoverLetter { get; set; }
        public string CurrentStatus { get; set; } = "Pending"; // Pending, Screening, Interview, Hired, Rejected
        public string? RejectionReason { get; set; }
        public int MatchScore { get; set; } // 0-100 score based on keyword matching
    }
}
