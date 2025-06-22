using MongoDB.Driver;
using HomeMate.Models;
using HomeMate.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeMate.Dtos;

namespace HomeMate.Services
{
    public class HousingService : IHousingService
    {
        private readonly IMongoCollection<HousingListing> _housingListings;

        public HousingService(MongoDbContext context)
        {
            _housingListings = context.HousingListings;
        }

        public async Task<IEnumerable<HousingListing>> SearchHousingAsync(HousingSearchFilters filters)
        {
            var filterBuilder = Builders<HousingListing>.Filter;
            var filter = filterBuilder.Empty;

            // Apply filters
            if (!string.IsNullOrEmpty(filters.ZipCode))
            {
                filter &= filterBuilder.Eq(h => h.ZipCode, filters.ZipCode);
            }

            if (filters.MinPrice.HasValue)
            {
                filter &= filterBuilder.Gte(h => h.Price, filters.MinPrice.Value);
            }

            if (filters.MaxPrice.HasValue)
            {
                filter &= filterBuilder.Lte(h => h.Price, filters.MaxPrice.Value);
            }

            if (filters.Bedrooms?.Any() == true)
            {
                filter &= filterBuilder.In(h => h.Bedrooms, filters.Bedrooms);
            }

            if (filters.Bathrooms.HasValue)
            {
                filter &= filterBuilder.Gte(h => h.Bathrooms, filters.Bathrooms.Value);
            }

            if (filters.PetFriendly.HasValue)
            {
                filter &= filterBuilder.Eq(h => h.PetFriendly, filters.PetFriendly.Value);
            }

            if (filters.Furnished.HasValue)
            {
                filter &= filterBuilder.Eq(h => h.Furnished, filters.Furnished.Value);
            }

            if (filters.Amenities?.Any() == true)
            {
                filter &= filterBuilder.All(h => h.Amenities, filters.Amenities);
            }

            // Apply sorting
            var sort = GetSortDefinition(filters.SortBy, filters.SortOrder);

            return await _housingListings.Find(filter)
                .Sort(sort)
                .Limit(50) // Limit results for performance
                .ToListAsync();
        }

        public async Task<IEnumerable<HousingListing>> GetFeaturedListingsAsync()
        {
            var filter = Builders<HousingListing>.Filter.Eq(h => h.IsFeatured, true);
            var featuredListings = await _housingListings.Find(filter).ToListAsync();
            return featuredListings;
        }

        public async Task<HousingListing?> GetListingByIdAsync(string id)
        {
            var filter = Builders<HousingListing>.Filter.Eq(h => h.Id, id);
            return await _housingListings.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<HousingListing> CreateListingAsync(HousingListing listing)
        {
            listing.DatePosted = DateTime.UtcNow;
            await _housingListings.InsertOneAsync(listing);
            return listing;
        }

        public async Task<bool> UpdateListingAsync(string id, HousingListing listing)
        {
            var filter = Builders<HousingListing>.Filter.Eq(h => h.Id, id);
            var result = await _housingListings.ReplaceOneAsync(filter, listing);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteListingAsync(string id)
        {
            var filter = Builders<HousingListing>.Filter.Eq(h => h.Id, id);
            var result = await _housingListings.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        private SortDefinition<HousingListing> GetSortDefinition(string? sortBy, string? sortOrder)
        {
            var isDescending = sortOrder?.ToLower() == "desc";

            return sortBy?.ToLower() switch
            {
                "price" => isDescending 
                    ? Builders<HousingListing>.Sort.Descending(h => h.Price)
                    : Builders<HousingListing>.Sort.Ascending(h => h.Price),
                "date" => isDescending 
                    ? Builders<HousingListing>.Sort.Descending(h => h.DatePosted)
                    : Builders<HousingListing>.Sort.Ascending(h => h.DatePosted),
                "bedrooms" => isDescending 
                    ? Builders<HousingListing>.Sort.Descending(h => h.Bedrooms)
                    : Builders<HousingListing>.Sort.Ascending(h => h.Bedrooms),
                _ => Builders<HousingListing>.Sort.Descending(h => h.DatePosted)
            };
        }
    }
}