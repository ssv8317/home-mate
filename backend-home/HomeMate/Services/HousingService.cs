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

            // ZipCode filter - only apply if not empty
            if (!string.IsNullOrWhiteSpace(filters.ZipCode))
            {
                Console.WriteLine($"🔍 Searching for zipCode: '{filters.ZipCode}'");
                filter &= filterBuilder.Eq(h => h.ZipCode, filters.ZipCode.Trim());
            }

            // Price filters - only apply if values are greater than 0
            if (filters.MinPrice.HasValue && filters.MinPrice > 0)
            {
                filter &= filterBuilder.Gte(h => h.Price, filters.MinPrice.Value);
            }

            if (filters.MaxPrice.HasValue && filters.MaxPrice > 0)
            {
                filter &= filterBuilder.Lte(h => h.Price, filters.MaxPrice.Value);
            }

            // Bedroom filter
            if (filters.Bedrooms?.Any() == true)
            {
                filter &= filterBuilder.In(h => h.Bedrooms, filters.Bedrooms);
            }

            // Bathroom filter - only apply if greater than 0
            if (filters.Bathrooms.HasValue && filters.Bathrooms > 0)
            {
                filter &= filterBuilder.Gte(h => h.Bathrooms, filters.Bathrooms.Value);
            }

            // Boolean filters - ONLY apply if explicitly TRUE
            if (filters.PetFriendly == true)
            {
                filter &= filterBuilder.Eq(h => h.PetFriendly, true);
            }

            if (filters.Furnished == true)
            {
                filter &= filterBuilder.Eq(h => h.Furnished, true);
            }

            // Amenities filter - use AnyIn instead of All
            if (filters.Amenities?.Any() == true)
            {
                filter &= filterBuilder.AnyIn(h => h.Amenities, filters.Amenities);
            }

            // Apply sorting
            var sort = GetSortDefinition(filters.SortBy, filters.SortOrder);

            var results = await _housingListings.Find(filter)
                .Sort(sort)
                .Limit(50)
                .ToListAsync();

            Console.WriteLine($"✅ Search returned {results.Count} results for zipCode '{filters.ZipCode}'");
            
            return results;
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