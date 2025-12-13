using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TalentTrack2.Data;
using TalentTrack2.Models;

namespace TalentTrack2.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PreferencesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PreferencesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<UserPreference>> GetPreferences()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var prefs = await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId);

            if (prefs == null)
            {
                // Create default preferences if they don't exist
                prefs = new UserPreference
                {
                    UserId = userId,
                    Theme = "light",
                    Language = "en",
                    EmailNotifications = true,
                    PushNotifications = true
                };
                _context.UserPreferences.Add(prefs);
                await _context.SaveChangesAsync();
            }

            return Ok(prefs);
        }

        [HttpPut]
        public async Task<IActionResult> UpdatePreferences(UserPreference model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var prefs = await _context.UserPreferences.FirstOrDefaultAsync(p => p.UserId == userId);

            if (prefs == null)
            {
                prefs = new UserPreference { UserId = userId };
                _context.UserPreferences.Add(prefs);
            }

            prefs.Theme = model.Theme;
            prefs.Language = model.Language;
            prefs.EmailNotifications = model.EmailNotifications;
            prefs.PushNotifications = model.PushNotifications;

            await _context.SaveChangesAsync();

            return Ok(prefs);
        }
    }
}
