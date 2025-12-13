using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentTrack2.Models
{
    public class Interview
    {
        public int Id { get; set; }
        
        public int ApplicationId { get; set; }
        [ForeignKey("ApplicationId")]
        public JobApplication Application { get; set; }

        public string EmployerId { get; set; }
        [ForeignKey("EmployerId")]
        public AppUser Employer { get; set; }

        public DateTime ScheduledDate { get; set; }
        public string MeetingLink { get; set; }
        public string Location { get; set; }
        public string? Feedback { get; set; }
        public bool IsCompleted { get; set; } = false;
    }
}
