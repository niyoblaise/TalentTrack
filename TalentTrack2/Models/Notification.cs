using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentTrack2.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        public string RecipientId { get; set; }
        [ForeignKey("RecipientId")]
        public AppUser Recipient { get; set; }

        public string Title { get; set; }
        public string Message { get; set; }
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Type { get; set; } // Global, JobAlert, ApplicationUpdate, Interview
    }
}
