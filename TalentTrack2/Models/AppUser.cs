using Microsoft.AspNetCore.Identity;

namespace TalentTrack2.Models
{
    public class AppUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime? DeactivatedUntil { get; set; }
        public string? DeactivationReason { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? LastLogin { get; set; }
    }
}
