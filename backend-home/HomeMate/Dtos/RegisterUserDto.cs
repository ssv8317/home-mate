using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace HomeMate.Dtos
{
    public class RegisterUserDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Range(18, 120)]
        public int Age { get; set; }

        [Required]
        public string Gender { get; set; } = string.Empty;

        public string Occupation { get; set; } = string.Empty;
        public string College { get; set; } = string.Empty;
        public string SleepSchedule { get; set; } = string.Empty;
        public string CleanlinessLevel { get; set; } = string.Empty;
        public string SmokingPreference { get; set; } = string.Empty;
        public string PetFriendly { get; set; } = string.Empty;
        public string BudgetRange { get; set; } = string.Empty;
        public string LocationPreference { get; set; } = string.Empty;
        public string AboutMe { get; set; } = string.Empty;

        // Add these if you want to support interests and profile pictures at registration
        public List<string> Interests { get; set; } = new List<string>();
        public List<string> ProfilePictures { get; set; } = new List<string>();

        [Required]
        public string ZipCode { get; set; } = string.Empty; // Added zip code
    }
}