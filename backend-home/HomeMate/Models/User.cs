using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace HomeMate.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;
        
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public int Age { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Occupation { get; set; } = string.Empty;  // Removed ?
        public string College { get; set; } = string.Empty;     // Removed ?
        public string SleepSchedule { get; set; } = string.Empty; // Removed ?
        public string CleanlinessLevel { get; set; } = string.Empty; // Removed ?
        public string SmokingPreference { get; set; } = string.Empty; // Removed ?
        public string PetFriendly { get; set; } = string.Empty; // Removed ?
        public string BudgetRange { get; set; } = string.Empty; // Removed ?
        public string LocationPreference { get; set; } = string.Empty; // Removed ?
        public string AboutMe { get; set; } = string.Empty; // Removed ?
        public string ZipCode { get; set; } = string.Empty; // Added zip code
        public DateTime CreatedAt { get; set; }
    }
}