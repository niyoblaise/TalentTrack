using Microsoft.AspNetCore.Mvc;
using TalentTrack2.DTOs;
using TalentTrack2.Services;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register/employer")]
        public async Task<IActionResult> RegisterEmployer([FromBody] RegisterDto model)
        {
            model.Role = "Employer";
            var result = await _authService.RegisterAsync(model);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("register/employee")]
        public async Task<IActionResult> RegisterEmployee([FromBody] RegisterDto model)
        {
            model.Role = "Employee";
            var result = await _authService.RegisterAsync(model);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("register/admin")]
        public async Task<IActionResult> RegisterAdmin([FromBody] RegisterDto model)
        {
            model.Role = "Admin";
            var result = await _authService.RegisterAsync(model);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var result = await _authService.LoginAsync(model);
            if (!result.IsSuccess)
                return Unauthorized(result);
            return Ok(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            var result = await _authService.ForgotPasswordAsync(model.Email);
            if (!result)
                return BadRequest(new { message = "Failed to send reset email" });
            return Ok(new { message = "Password reset email sent" });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var result = await _authService.ResetPasswordAsync(model);
            if (!result)
                return BadRequest(new { message = "Password reset failed" });
            return Ok(new { message = "Password reset successful" });
        }

        [HttpPost("send-otp")]
        public async Task<IActionResult> SendOtp([FromBody] string userId)
        {
            var result = await _authService.SendOtpAsync(userId);
            if (!result)
                return BadRequest(new { message = "Failed to send OTP" });
            return Ok(new { message = "OTP sent successfully" });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto model)
        {
            var result = await _authService.VerifyOtpAsync(model);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginDto model)
        {
            var result = await _authService.GoogleLoginAsync(model);
            if (!result.IsSuccess)
                return BadRequest(result);
            return Ok(result);
        }
        [HttpGet("profile")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var profile = await _authService.GetProfileAsync(userId);
            if (profile == null) return NotFound();

            return Ok(profile);
        }
    }
}
