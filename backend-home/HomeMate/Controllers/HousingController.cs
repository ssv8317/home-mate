using Microsoft.AspNetCore.Mvc;
using HomeMate.Models;
using HomeMate.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

namespace HomeMate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HousingController : ControllerBase
    {
        private readonly IHousingService _housingService;

        public HousingController(IHousingService housingService)
        {
            _housingService = housingService;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<HousingListing>>> SearchHousing(
            [FromQuery] string? zipCode,
            [FromQuery] int? minPrice,
            [FromQuery] int? maxPrice,
            [FromQuery] string? bedrooms,
            [FromQuery] int? bathrooms,
            [FromQuery] bool? petFriendly,
            [FromQuery] bool? furnished,
            [FromQuery] string? amenities,
            [FromQuery] string? sortBy = "date",
            [FromQuery] string? sortOrder = "desc")
        {
            var filters = new HousingSearchFilters
            {
                ZipCode = zipCode,
                MinPrice = minPrice,
                MaxPrice = maxPrice,
                Bedrooms = !string.IsNullOrEmpty(bedrooms) ? bedrooms.Split(',').Select(int.Parse).ToList() : null,
                Bathrooms = bathrooms,
                PetFriendly = petFriendly,
                Furnished = furnished,
                Amenities = !string.IsNullOrEmpty(amenities) ? amenities.Split(',').ToList() : null,
                SortBy = sortBy,
                SortOrder = sortOrder
            };

            var results = await _housingService.SearchHousingAsync(filters);
            return Ok(results);
        }

        [HttpGet("featured")]
        public async Task<ActionResult<IEnumerable<HousingListing>>> GetFeaturedListings()
        {
            try
            {
                Console.WriteLine("🔍 Getting featured listings...");
                var featuredListings = await _housingService.GetFeaturedListingsAsync();
                Console.WriteLine($"📊 Found {featuredListings.Count()} featured listings");
                return Ok(featuredListings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error: {ex.Message}");
                return StatusCode(500, $"Error getting featured listings: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HousingListing>> GetListingById(string id)
        {
            var listing = await _housingService.GetListingByIdAsync(id);
            if (listing == null)
            {
                return NotFound();
            }
            return Ok(listing);
        }
    }
}