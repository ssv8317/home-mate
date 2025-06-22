using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System; // Add this line
using HomeMate.Dtos;
using HomeMate.Models;
using HomeMate.Services;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;

        public AuthController(UserService userService)
        {
            _userService = userService;
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