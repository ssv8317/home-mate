using HomeMate.Data;
using HomeMate.Models;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeMate.Services
{
    public class MatchService : IMatchService
    {
        private readonly MongoDbContext _context;
        private readonly IMongoCollection<RoommateProfile> _profiles;
        private readonly IMongoCollection<Match> _matches;

        public MatchService(MongoDbContext context)
        {
            _context = context;
            _profiles = _context.Database.GetCollection<RoommateProfile>("roommate_profiles");
            _matches = _context.Database.GetCollection<Match>("matches");
        }

        public async Task<List<MatchResponse>> GetPotentialMatchesAsync(string userId)
        {
            try
            {
                // Get user's profile
                var userProfile = await GetRoommateProfileAsync(userId);
                if (userProfile == null)
                    return new List<MatchResponse>();

                // Get all other active profiles
                var otherProfiles = await _profiles
                    .Find(p => p.UserId != userId && p.IsActive)
                    .ToListAsync();

                // Get existing matches/swipes for this user
                var existingMatches = await _matches
                    .Find(m => m.UserId1 == userId || m.UserId2 == userId)
                    .ToListAsync();

                // Only exclude profiles that the current user has swiped on (UserId1 == userId)
                var swipedProfileIds = existingMatches
                    .Where(m => m.UserId1 == userId)
                    .Select(m => m.ProfileId2)
                    .ToHashSet();

                var availableProfiles = otherProfiles
                    .Where(p => !swipedProfileIds.Contains(p.Id))
                    .ToList();

                // Calculate compatibility and create responses
                var matchResponses = new List<MatchResponse>();
                foreach (var profile in availableProfiles)
                {
                    var compatibility = await CalculateCompatibilityAsync(userProfile, profile);
                    if (compatibility >= 50) // Only add if score is 60 or higher
                    {
                        matchResponses.Add(new MatchResponse
                        {
                            Id = profile.Id,
                            Profile = profile,
                            CompatibilityScore = compatibility,
                            IsNewMatch = false
                        });
                    }
                }

                // Sort by compatibility score (highest first)
                return matchResponses.OrderByDescending(m => m.CompatibilityScore).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting potential matches: {ex.Message}");
            }
        }

        public async Task<MatchResponse> SwipeAsync(string userId, SwipeRequest request)
        {
            try
            {
                var userProfile = await GetRoommateProfileAsync(userId);
                var targetProfile = await _profiles
                    .Find(p => p.Id == request.ProfileId)
                    .FirstOrDefaultAsync();

                if (userProfile == null || targetProfile == null)
                    throw new Exception("Profile not found");

                // Check if match already exists
                var existingMatch = await _matches
                    .Find(m => m.UserId1 == userId && m.ProfileId2 == request.ProfileId)
                    .FirstOrDefaultAsync();

                if (existingMatch != null)
                    throw new Exception("Already swiped on this profile");

                // Calculate compatibility
                var compatibility = await CalculateCompatibilityAsync(userProfile, targetProfile);

                // Create new match record
                var match = new Match
                {
                    UserId1 = userId,
                    UserId2 = targetProfile.UserId,
                    ProfileId1 = userProfile.Id,
                    ProfileId2 = targetProfile.Id,
                    CompatibilityScore = compatibility,
                    User1Action = request.Action,
                    Status = MatchStatus.Pending
                };

                // Check if the other user already liked this user
                var reverseMatch = await _matches
                    .Find(m => m.UserId1 == targetProfile.UserId && m.ProfileId2 == userProfile.Id)
                    .FirstOrDefaultAsync();

                bool isNewMatch = false;
                if (reverseMatch != null && reverseMatch.User1Action == UserAction.Like && request.Action == UserAction.Like)
                {
                    // It's a mutual like - create a match!
                    match.Status = MatchStatus.Matched;
                    match.MatchedAt = DateTime.UtcNow;
                    reverseMatch.Status = MatchStatus.Matched;
                    reverseMatch.MatchedAt = DateTime.UtcNow;
                    reverseMatch.User2Action = request.Action;
                    
                    await _matches.ReplaceOneAsync(m => m.Id == reverseMatch.Id, reverseMatch);
                    isNewMatch = true;
                }

                await _matches.InsertOneAsync(match);

                return new MatchResponse
                {
                    Id = targetProfile.Id,
                    Profile = targetProfile,
                    CompatibilityScore = compatibility,
                    IsNewMatch = isNewMatch
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"Error processing swipe: {ex.Message}");
            }
        }

        public async Task<List<Match>> GetUserMatchesAsync(string userId)
        {
            try
            {
                return await _matches
                    .Find(m => (m.UserId1 == userId || m.UserId2 == userId) && m.Status == MatchStatus.Matched)
                    .SortByDescending(m => m.MatchedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting user matches: {ex.Message}");
            }
        }

        public async Task<RoommateProfile?> GetRoommateProfileAsync(string userId)
        {
            try
            {
                return await _profiles
                    .Find(p => p.UserId == userId)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting roommate profile: {ex.Message}");
            }
        }

        public async Task<RoommateProfile> CreateOrUpdateProfileAsync(string userId, RoommateProfile profile)
        {
            try
            {
                // Fetch user registration data
                var usersCollection = _context.Database.GetCollection<User>("Users");
                var user = await usersCollection.Find(u => u.Id == userId).FirstOrDefaultAsync();
                if (user == null)
                    throw new Exception("User not found");

                // Fill missing fields from registration data
                profile.UserId = userId;
                if (string.IsNullOrWhiteSpace(profile.DisplayName))
                    profile.DisplayName = user.FullName;
                profile.Age = profile.Age == 0 ? user.Age : profile.Age;
                if (string.IsNullOrWhiteSpace(profile.Gender))
                    profile.Gender = user.Gender;
                if (string.IsNullOrWhiteSpace(profile.Occupation))
                    profile.Occupation = user.Occupation;
                if (string.IsNullOrWhiteSpace(profile.Bio))
                    profile.Bio = user.AboutMe;

                // Cleanliness: map string to int
                if (profile.Cleanliness == 0 && !string.IsNullOrEmpty(user.CleanlinessLevel))
                {
                    profile.Cleanliness = user.CleanlinessLevel.ToLower() switch
                    {
                        "high" => 5,
                        "medium" => 3,
                        "low" => 1,
                        _ => 3
                    };
                }

                // SmokingOk: map from "Yes"/"No"
                if (!profile.SmokingOk && !string.IsNullOrEmpty(user.SmokingPreference))
                    profile.SmokingOk = user.SmokingPreference.Trim().ToLower() == "yes";

                // PetsOk: map from "Yes"/"No"
                if (!profile.PetsOk && !string.IsNullOrEmpty(user.PetFriendly))
                    profile.PetsOk = user.PetFriendly.Trim().ToLower() == "yes";

                // Budget
                if (profile.BudgetMin == 0 && decimal.TryParse(user.BudgetRange, out var minBudget))
                    profile.BudgetMin = minBudget;
                if (profile.BudgetMax == 0 && decimal.TryParse(user.BudgetRange, out var maxBudget))
                    profile.BudgetMax = maxBudget;

                // PreferredLocations
                if ((profile.PreferredLocations == null || !profile.PreferredLocations.Any()) && !string.IsNullOrEmpty(user.LocationPreference))
                    profile.PreferredLocations = new List<string> { user.LocationPreference };

                // You can add more mappings if you add more fields to RoommateProfile

                profile.UpdatedAt = DateTime.UtcNow;

                var existingProfile = await GetRoommateProfileAsync(userId);
                if (existingProfile != null)
                {
                    profile.Id = existingProfile.Id;
                    profile.CreatedAt = existingProfile.CreatedAt;
                    await _profiles.ReplaceOneAsync(p => p.UserId == userId, profile);
                }
                else
                {
                    profile.CreatedAt = DateTime.UtcNow;
                    await _profiles.InsertOneAsync(profile);
                }

                return profile;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating/updating profile: {ex.Message}");
            }
        }

        public async Task<double> CalculateCompatibilityAsync(RoommateProfile profile1, RoommateProfile profile2)
        {
            try
            {
                double totalScore = 0;
                int factors = 0;

                // Budget compatibility (25% weight)
                var budgetScore = CalculateBudgetCompatibility(profile1, profile2);
                totalScore += budgetScore * 0.25;
                factors++;

                // Lifestyle compatibility (35% weight)
                var lifestyleScore = CalculateLifestyleCompatibility(profile1, profile2);
                totalScore += lifestyleScore * 0.35;
                factors++;

                // Interest compatibility (20% weight)
                var interestScore = CalculateInterestCompatibility(profile1, profile2);
                totalScore += interestScore * 0.20;
                factors++;

                // Location compatibility (20% weight)
                var locationScore = CalculateLocationCompatibility(profile1, profile2);
                totalScore += locationScore * 0.20;
                factors++;

                return Math.Round(totalScore, 2);
            }
            catch
            {
                return 0.0;
            }
        }

        private double CalculateBudgetCompatibility(RoommateProfile profile1, RoommateProfile profile2)
        {
            var overlap = Math.Max(0, (double)(Math.Min(profile1.BudgetMax, profile2.BudgetMax) - Math.Max(profile1.BudgetMin, profile2.BudgetMin)));
            var range1 = (double)(profile1.BudgetMax - profile1.BudgetMin);
            var range2 = (double)(profile2.BudgetMax - profile2.BudgetMin);
            var avgRange = (range1 + range2) / 2;

            return avgRange > 0 ? Math.Min(100, (overlap / avgRange) * 100) : 0;
        }

        private double CalculateLifestyleCompatibility(RoommateProfile profile1, RoommateProfile profile2)
        {
            double score = 0;
            int factors = 0;

            // Cleanliness (closer is better)
            score += Math.Max(0, 100 - Math.Abs(profile1.Cleanliness - profile2.Cleanliness) * 20);
            factors++;

            // Social level (closer is better)
            score += Math.Max(0, 100 - Math.Abs(profile1.SocialLevel - profile2.SocialLevel) * 20);
            factors++;

            // Noise level (closer is better)
            score += Math.Max(0, 100 - Math.Abs(profile1.NoiseLevel - profile2.NoiseLevel) * 20);
            factors++;

            // Boolean preferences (must match)
            if (profile1.SmokingOk == profile2.SmokingOk) score += 100;
            factors++;

            if (profile1.PetsOk == profile2.PetsOk) score += 100;
            factors++;

            return factors > 0 ? score / factors : 0;
        }

        private double CalculateInterestCompatibility(RoommateProfile profile1, RoommateProfile profile2)
        {
            if (!profile1.Interests.Any() || !profile2.Interests.Any())
                return 50; // Neutral score if no interests

            var commonInterests = profile1.Interests.Intersect(profile2.Interests).Count();
            var totalInterests = profile1.Interests.Union(profile2.Interests).Count();
            
            return totalInterests > 0 ? (double)commonInterests / totalInterests * 100 : 0;
        }

        private double CalculateLocationCompatibility(RoommateProfile profile1, RoommateProfile profile2)
        {
            if (!profile1.PreferredLocations.Any() || !profile2.PreferredLocations.Any())
                return 50; // Neutral score if no preferences

            var commonLocations = profile1.PreferredLocations.Intersect(profile2.PreferredLocations).Count();
            return commonLocations > 0 ? 100 : 25; // High score for overlap, low but not zero for no overlap
        }
    }
}