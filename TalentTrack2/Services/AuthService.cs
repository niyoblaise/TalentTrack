using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TalentTrack2.Data;
using TalentTrack2.DTOs;
using TalentTrack2.Models;
using Google.Apis.Auth;

namespace TalentTrack2.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly SignInManager<AppUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ApplicationDbContext _context;

        public AuthService(UserManager<AppUser> userManager,
                           RoleManager<IdentityRole> roleManager,
                           SignInManager<AppUser> signInManager, 
                           IConfiguration configuration,
                           IEmailService emailService,
                           ApplicationDbContext context)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _context = context;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto model)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return new AuthResponseDto { IsSuccess = false, Message = "User already exists!" };

            AppUser user = new AppUser()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return new AuthResponseDto { IsSuccess = false, Message = $"User creation failed: {errors}" };
            }

            if (!await _roleManager.RoleExistsAsync(model.Role))
                await _userManager.AddToRoleAsync(user, "Employee"); // Default fallback
            else
                await _userManager.AddToRoleAsync(user, model.Role);

            return new AuthResponseDto { IsSuccess = true, Message = "User created successfully!" };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                if (!user.IsActive)
                     return new AuthResponseDto { IsSuccess = false, Message = "Account is deactivated." };

                // Send OTP
                await SendOtpAsync(user.Id);

                return new AuthResponseDto
                {
                    IsSuccess = true,
                    RequiresOtp = true,
                    UserId = user.Id,
                    Message = "OTP sent to your email."
                };
            }
            return new AuthResponseDto { IsSuccess = false, Message = "Invalid credentials" };
        }

        public async Task<string> GenerateJwtToken(AppUser user)
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id), // Standard User ID claim
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.Id),
                new Claim("FirstName", user.FirstName ?? ""),
                new Claim("LastName", user.LastName ?? "")
            };

            foreach (var role in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, role));
                
                // Add Permission Claims from Role
                var identityRole = await _roleManager.FindByNameAsync(role);
                if (identityRole != null)
                {
                    var roleClaims = await _roleManager.GetClaimsAsync(identityRole);
                    foreach (var claim in roleClaims)
                    {
                        // Avoid duplicates if user has multiple roles with same permission
                        if (!authClaims.Any(c => c.Type == claim.Type && c.Value == claim.Value))
                        {
                            authClaims.Add(claim);
                        }
                    }
                }
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"] ?? "DefaultKeyThatIsLongEnough1234567890"));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddDays(double.Parse(_configuration["Jwt:ExpireDays"] ?? "7")),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task<bool> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return false;

            // Generate password reset token
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // URL encode the token for safe transmission
            var encodedToken = Uri.EscapeDataString(token);
            var encodedEmail = Uri.EscapeDataString(email);
            
            // Create reset link (frontend URL)
            var resetLink = $"http://localhost:5173/reset-password?token={encodedToken}&email={encodedEmail}";
            
            await _emailService.SendEmailAsync(
                email, 
                "Password Reset Request", 
                $"Click the link below to reset your password:\n\n{resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email."
            );
            
            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return false;

            // Reset password using the token from the email link
            var result = await _userManager.ResetPasswordAsync(user, model.Code, model.NewPassword);
            return result.Succeeded;
        }

        public async Task<bool> SendOtpAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            var code = new Random().Next(100000, 999999).ToString();
            var otp = new OtpCode
            {
                UserId = userId,
                Code = code,
                ExpiryTime = DateTime.UtcNow.AddMinutes(10)
            };

            _context.OtpCodes.Add(otp);
            await _context.SaveChangesAsync();

            await _emailService.SendEmailAsync(user.Email, "Your OTP Code", $"Your OTP code is: {code}");
            return true;
        }

        public async Task<AuthResponseDto> VerifyOtpAsync(VerifyOtpDto model)
        {
            var otp = _context.OtpCodes
                .Where(o => o.UserId == model.UserId && o.Code == model.Code && !o.IsUsed)
                .OrderByDescending(o => o.ExpiryTime)
                .FirstOrDefault();

            if (otp == null || otp.ExpiryTime < DateTime.UtcNow) 
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid or expired OTP" };

            otp.IsUsed = true;
            await _context.SaveChangesAsync();

            // Generate Token
            var user = await _userManager.FindByIdAsync(model.UserId);
            var token = await GenerateJwtToken(user);
            var userRoles = await _userManager.GetRolesAsync(user);

            user.LastLogin = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            return new AuthResponseDto
            {
                IsSuccess = true,
                Token = token,
                Role = userRoles.FirstOrDefault(),
                Message = "Login successful"
            };
        }
        public async Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto model)
        {
            try
            {
                var settings = new GoogleJsonWebSignature.ValidationSettings()
                {
                    Audience = new List<string>() { _configuration["Google:ClientId"] }
                };

                var payload = await GoogleJsonWebSignature.ValidateAsync(model.IdToken, settings);

                var user = await _userManager.FindByEmailAsync(payload.Email);
                if (user == null)
                {
                    // Create new user
                    user = new AppUser
                    {
                        Email = payload.Email,
                        UserName = payload.Email,
                        FirstName = payload.GivenName,
                        LastName = payload.FamilyName,
                        SecurityStamp = Guid.NewGuid().ToString(),
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user);
                    if (!result.Succeeded)
                        return new AuthResponseDto { IsSuccess = false, Message = "Failed to create user from Google account" };

                    await _userManager.AddToRoleAsync(user, "Employee"); // Default role
                }

                // Generate Token (Skip OTP for Google Login for now)
                var token = await GenerateJwtToken(user);
                var userRoles = await _userManager.GetRolesAsync(user);

                user.LastLogin = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);

                return new AuthResponseDto
                {
                    IsSuccess = true,
                    Token = token,
                    Role = userRoles.FirstOrDefault(),
                    Message = "Login successful"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto { IsSuccess = false, Message = "Invalid Google Token: " + ex.Message };
            }
        }

        public async Task<object> GetProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);

            return new
            {
                user.FirstName,
                user.LastName,
                user.Email,
                Role = roles.FirstOrDefault()
            };
        }
    }
}
