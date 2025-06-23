using HomeMate.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeMate.Services
{
    public interface IMatchService
    {
        Task<List<MatchResponse>> GetPotentialMatchesAsync(string userId);
        Task<MatchResponse> SwipeAsync(string userId, SwipeRequest request);
        Task<List<Match>> GetUserMatchesAsync(string userId);
        Task<RoommateProfile?> GetRoommateProfileAsync(string userId);
        Task<RoommateProfile> CreateOrUpdateProfileAsync(string userId, RoommateProfile profile);
        Task<double> CalculateCompatibilityAsync(RoommateProfile profile1, RoommateProfile profile2);
    }
}