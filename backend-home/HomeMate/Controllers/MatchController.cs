using Microsoft.AspNetCore.Mvc;
using HomeMate.Models;
using HomeMate.Services;
using System;
using System.Threading.Tasks;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MatchController : ControllerBase
    {
        private readonly IMatchService _matchService;

        public MatchController(IMatchService matchService)
        {
            _matchService = matchService;
        }

        [HttpGet("potential/{userId}")]
        public async Task<ActionResult> GetPotentialMatches(string userId)
        {
            try
            {
                var matches = await _matchService.GetPotentialMatchesAsync(userId);
                return Ok(matches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting potential matches", error = ex.Message });
            }
        }

        [HttpPost("swipe/{userId}")]
        public async Task<ActionResult> Swipe(string userId, [FromBody] SwipeRequest request)
        {
            try
            {
                var result = await _matchService.SwipeAsync(userId, request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error processing swipe", error = ex.Message });
            }
        }

        [HttpGet("matches/{userId}")]
        public async Task<ActionResult> GetMatches(string userId)
        {
            try
            {
                var matches = await _matchService.GetUserMatchesAsync(userId);
                return Ok(matches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting matches", error = ex.Message });
            }
        }

        [HttpGet("profile/{userId}")]
        public async Task<ActionResult> GetProfile(string userId)
        {
            try
            {
                var profile = await _matchService.GetRoommateProfileAsync(userId);
                if (profile == null)
                    return NotFound(new { message = "Profile not found" });
                
                return Ok(profile);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting profile", error = ex.Message });
            }
        }

        [HttpPost("profile/{userId}")]
        public async Task<ActionResult> CreateOrUpdateProfile(string userId, [FromBody] RoommateProfile profile)
        {
            try
            {
                var result = await _matchService.CreateOrUpdateProfileAsync(userId, profile);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating/updating profile", error = ex.Message });
            }
        }
    }
}