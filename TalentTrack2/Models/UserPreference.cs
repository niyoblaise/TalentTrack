using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TalentTrack2.Models
{
    public class UserPreference
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; } = string.Empty;

        [ForeignKey("UserId")]
        public AppUser? User { get; set; }

        public string Theme { get; set; } = "light"; // light, dark
        public string Language { get; set; } = "en"; // en, fr, etc.
        public bool EmailNotifications { get; set; } = true;
        public bool PushNotifications { get; set; } = true;
    }
}
