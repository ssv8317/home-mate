using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System; // Add this line
using System.Linq;
using HomeMate.Dtos;
using HomeMate.Models;
using HomeMate.Services;
using System.Collections.Generic;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly RoommateProfileService _roommateProfileService; // Add this line

        public AuthController(UserService userService, RoommateProfileService roommateProfileService) // Modify constructor
        {
            _userService = userService;
            _roommateProfileService = roommateProfileService; // Add this line
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserDto registerUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userService.RegisterUserAsync(registerUserDto);

                // Parse budget range (e.g., "1000-1500") to min/max
                var budgetParts = user.BudgetRange.Split('-');
                decimal budgetMin = 0, budgetMax = 0;
                if (budgetParts.Length == 2)
                {
                    decimal.TryParse(budgetParts[0], out budgetMin);
                    decimal.TryParse(budgetParts[1], out budgetMax);
                }

                // Extract interests from AboutMe (split by space, comma, or semicolon)
                var interests = new List<string>();
                if (!string.IsNullOrWhiteSpace(user.AboutMe))
                {
                    interests = user.AboutMe
                        .Split(new[] { ' ', ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                        .Distinct()
                        .ToList();
                }

                var roommateProfile = new RoommateProfile
                {
                    UserId = user.Id,
                    DisplayName = user.FullName,
                    Age = user.Age,
                    Gender = user.Gender,
                    Occupation = user.Occupation,
                    Bio = user.AboutMe,
                    ProfilePictures = new List<string>(),
                    BudgetMin = budgetMin,
                    BudgetMax = budgetMax,
                    PreferredLocations = new List<string> { user.LocationPreference },
                    Cleanliness = int.TryParse(user.CleanlinessLevel, out var clean) ? clean : 3,
                    SocialLevel = 3, // Default, or get from registration if available
                    NoiseLevel = 3,  // Default, or get from registration if available
                    SmokingOk = user.SmokingPreference.ToLower() == "yes",
                    PetsOk = user.PetFriendly.ToLower() == "yes",
                    Interests = interests,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ZipCode = user.ZipCode, // Add zip code to roommate profile
                };
                await _roommateProfileService.CreateProfileAsync(roommateProfile);

                var response = new
                {
                    user
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                // Log the error for debugging
                Console.WriteLine($"[Register Error] {ex}");
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginUserDto loginUserDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _userService.LoginUserAsync(loginUserDto);
                
                if (result == null)
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                var response = new
                {
                    token = result.Token,
                    user = result.User
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}