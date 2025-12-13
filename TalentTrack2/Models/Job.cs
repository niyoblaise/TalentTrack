using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentTrack2.Models
{
    public class Job
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Description { get; set; }
        public string Requirements { get; set; }
        public string SalaryRange { get; set; }
        public string Location { get; set; }
        public string Type { get; set; } // Full-time, Part-time, etc.
        public DateTime PostedDate { get; set; } = DateTime.UtcNow;
        public DateTime Deadline { get; set; }
        
        public int CategoryId { get; set; }
        [ForeignKey("CategoryId")]
        public Category Category { get; set; }

        public string EmployerId { get; set; }
        [ForeignKey("EmployerId")]
        public AppUser Employer { get; set; }

        public bool IsApproved { get; set; } = false;
        public string Status { get; set; } = "Open"; // Open, Closed
        public int Views { get; set; } = 0;
        public string? RejectionReason { get; set; }
    }
}
