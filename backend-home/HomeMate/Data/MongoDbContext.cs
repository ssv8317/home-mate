using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using HomeMate.Models;
using System;

namespace HomeMate.Data
{
    public class MongoDbContext
    {
        public IMongoDatabase Database { get; }

        public MongoDbContext(IConfiguration configuration)
        {
            // Prefer environment variable, fallback to config
            var connectionString = Environment.GetEnvironmentVariable("MONGODB_URI");
            if (string.IsNullOrEmpty(connectionString))
            {
                connectionString = configuration.GetConnectionString("MongoDb");
            }
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("MongoDB connection string not found. Set the MONGODB_URI environment variable or provide it in appsettings.json.");
            }

            var mongoUrl = new MongoUrl(connectionString);
            var client = new MongoClient(mongoUrl);
            Database = client.GetDatabase(mongoUrl.DatabaseName ?? "homemate");
        }

        // Existing collection
        public IMongoCollection<User> Users => Database.GetCollection<User>("Users");
        
        // NEW: Housing collection
        public IMongoCollection<HousingListing> HousingListings => Database.GetCollection<HousingListing>("housingListings");

        // NEW: Roommate Profile collection
        public IMongoCollection<RoommateProfile> RoommateProfiles => Database.GetCollection<RoommateProfile>("roommate_profiles");

        // NEW: Messages collection
        public IMongoCollection<Message> Messages => Database.GetCollection<Message>("messages");
    }
}