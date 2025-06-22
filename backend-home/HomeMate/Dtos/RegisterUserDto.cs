using System.ComponentModel.DataAnnotations;

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

        // Remove ? to avoid nullable warnings for now
        public string Occupation { get; set; } = string.Empty;
        public string College { get; set; } = string.Empty;
        public string SleepSchedule { get; set; } = string.Empty;
        public string CleanlinessLevel { get; set; } = string.Empty;
        public string SmokingPreference { get; set; } = string.Empty;
        public string PetFriendly { get; set; } = string.Empty;
        public string BudgetRange { get; set; } = string.Empty;
        public string LocationPreference { get; set; } = string.Empty;
        public string AboutMe { get; set; } = string.Empty;
    }
}