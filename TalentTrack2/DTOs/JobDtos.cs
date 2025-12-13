using System.ComponentModel.DataAnnotations;

namespace TalentTrack2.DTOs
{
    public class JobDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string SalaryRange { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime Deadline { get; set; }
        public int CategoryId { get; set; }
    }

    public class JobResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Requirements { get; set; } = string.Empty;
        public string SalaryRange { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public DateTime PostedDate { get; set; }
        public DateTime Deadline { get; set; }
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public string EmployerId { get; set; } = string.Empty;
        public string EmployerName { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Views { get; set; }
        public int ApplicantCount { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class CategoryDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}
