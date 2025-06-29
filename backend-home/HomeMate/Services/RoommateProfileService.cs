using HomeMate.Models;
using System.Threading.Tasks;
using MongoDB.Driver;
using HomeMate.Data;

namespace HomeMate.Services
{
    public class RoommateProfileService
    {
        private readonly IMongoCollection<RoommateProfile> _profiles;

        public RoommateProfileService(MongoDbContext context)
        {
            _profiles = context.RoommateProfiles;
        }

        public async Task CreateProfileAsync(RoommateProfile profile)
        {
            await _profiles.InsertOneAsync(profile);
        }

        public async Task DeleteProfileByUserIdAsync(string userId)
        {
            await _profiles.DeleteOneAsync(p => p.UserId == userId);
        }

        // You can add more methods here for updating, fetching, etc.
    }
}