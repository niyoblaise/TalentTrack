using TalentTrack2.DTOs;

namespace TalentTrack2.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto model);
        Task<AuthResponseDto> LoginAsync(LoginDto model);
        Task<string> GenerateJwtToken(Models.AppUser user);
        Task<bool> ForgotPasswordAsync(string email);
        Task<bool> ResetPasswordAsync(ResetPasswordDto model);
        Task<bool> SendOtpAsync(string userId);
        Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpDto model);
        Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto model);
        Task<object> GetProfileAsync(string userId);
    }
}
