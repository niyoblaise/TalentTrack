using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentTrack2.Models
{
    public class ApplicationHistory
    {
        public int Id { get; set; }
        
        public int ApplicationId { get; set; }
        [ForeignKey("ApplicationId")]
        public JobApplication Application { get; set; }

        public string Status { get; set; }
        public DateTime ChangedDate { get; set; } = DateTime.UtcNow;
        public string Notes { get; set; }
    }
}
