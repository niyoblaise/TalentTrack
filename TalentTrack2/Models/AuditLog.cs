using System;
using System.ComponentModel.DataAnnotations;

namespace TalentTrack2.Models
{
    public class AuditLog
    {
        [Key]
        public int Id { get; set; }
        public string? UserId { get; set; }
        public string ActionType { get; set; } = string.Empty;
        public string EntityName { get; set; } = string.Empty;
        public string? EntityId { get; set; }
        public string? DetailsJson { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string? IpAddress { get; set; }
        public int ResponseStatusCode { get; set; }
        public long DurationMs { get; set; }
    }
}
