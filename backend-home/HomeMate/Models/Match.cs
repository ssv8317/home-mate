using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace HomeMate.Models
{
    public class RoommateProfile
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("userId")]
        public string UserId { get; set; } = string.Empty;

        [BsonElement("displayName")]
        public string DisplayName { get; set; } = string.Empty;

        [BsonElement("age")]
        public int Age { get; set; }

        [BsonElement("gender")]
        public string Gender { get; set; } = string.Empty;

        [BsonElement("occupation")]
        public string Occupation { get; set; } = string.Empty;

        [BsonElement("bio")]
        public string Bio { get; set; } = string.Empty;

        [BsonElement("profilePictures")]
        public List<string> ProfilePictures { get; set; } = new List<string>();

        // Budget & Location
        [BsonElement("budgetMin")]
        public decimal BudgetMin { get; set; }

        [BsonElement("budgetMax")]
        public decimal BudgetMax { get; set; }

        [BsonElement("preferredLocations")]
        public List<string> PreferredLocations { get; set; } = new List<string>();

        // Lifestyle Preferences (1-5 scale)
        [BsonElement("cleanliness")]
        public int Cleanliness { get; set; }

        [BsonElement("socialLevel")]
        public int SocialLevel { get; set; }

        [BsonElement("noiseLevel")]
        public int NoiseLevel { get; set; }

        [BsonElement("smokingOk")]
        public bool SmokingOk { get; set; }

        [BsonElement("petsOk")]
        public bool PetsOk { get; set; }

        [BsonElement("interests")]
        public List<string> Interests { get; set; } = new List<string>();

        [BsonElement("isActive")]
        public bool IsActive { get; set; } = true;

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updatedAt")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow; // <-- Add this line
    }

    public class Match
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

        [BsonElement("userId1")]
        public string UserId1 { get; set; } = string.Empty;

        [BsonElement("userId2")]
        public string UserId2 { get; set; } = string.Empty;

        [BsonElement("profileId1")]
        public string ProfileId1 { get; set; } = string.Empty;

        [BsonElement("profileId2")]
        public string ProfileId2 { get; set; } = string.Empty;

        [BsonElement("compatibilityScore")]
        public double CompatibilityScore { get; set; }

        [BsonElement("status")]
        public MatchStatus Status { get; set; } = MatchStatus.Pending;

        [BsonElement("user1Action")]
        public UserAction User1Action { get; set; } = UserAction.None;

        [BsonElement("user2Action")]
        public UserAction User2Action { get; set; } = UserAction.None;

        [BsonElement("matchedAt")]
        public DateTime? MatchedAt { get; set; }

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum MatchStatus
    {
        Pending,
        Matched,
        Rejected,
        Expired
    }

    public enum UserAction
    {
        None,
        Like,
        Pass,
        SuperLike
    }

    // DTOs for API responses
    public class MatchResponse
    {
        public string Id { get; set; } = string.Empty;
        public RoommateProfile Profile { get; set; } = new RoommateProfile();
        public double CompatibilityScore { get; set; }
        public bool IsNewMatch { get; set; }
    }

    public class SwipeRequest
    {
        public string ProfileId { get; set; } = string.Empty;
        public UserAction Action { get; set; }
    }
}