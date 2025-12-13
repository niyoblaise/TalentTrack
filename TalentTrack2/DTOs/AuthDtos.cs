using System.ComponentModel.DataAnnotations;

namespace TalentTrack2.DTOs
{
    public class RegisterDto
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        [MinLength(6)]
        public string Password { get; set; }
        public string Role { get; set; } // Employer, Employee
    }

    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public string Role { get; set; }
        public bool RequiresOtp { get; set; }
        public string UserId { get; set; }
    }

    public class ForgotPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class ResetPasswordDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        [Required]
        public string Code { get; set; } // Reset token from email link
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }

    public class VerifyOtpDto
    {
        [Required]
        public string UserId { get; set; }
        [Required]
        public string Code { get; set; }
    }
    public class GoogleLoginDto
    {
        [Required]
        public string IdToken { get; set; }
    }
}
