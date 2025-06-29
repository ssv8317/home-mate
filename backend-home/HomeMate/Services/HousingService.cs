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
            var builder = Builders<HousingListing>.Filter;
            var filter = builder.Empty;

            if (!string.IsNullOrEmpty(filters.ZipCode))
                filter &= builder.Eq(x => x.ZipCode, filters.ZipCode);

            if (filters.MinPrice.HasValue)
                filter &= builder.Gte(x => x.Price, filters.MinPrice.Value);

            if (filters.MaxPrice.HasValue)
                filter &= builder.Lte(x => x.Price, filters.MaxPrice.Value);

            if (filters.Bedrooms != null && filters.Bedrooms.Any())
                filter &= builder.In(x => x.Bedrooms, filters.Bedrooms);

            if (filters.Bathrooms.HasValue)
                filter &= builder.Eq(x => x.Bathrooms, filters.Bathrooms.Value);

            if (filters.PetFriendly.HasValue)
                filter &= builder.Eq(x => x.PetFriendly, filters.PetFriendly.Value);

            if (filters.Furnished.HasValue)
                filter &= builder.Eq(x => x.Furnished, filters.Furnished.Value);

            if (filters.Amenities != null && filters.Amenities.Any())
                filter &= builder.All(x => x.Amenities, filters.Amenities);

            var sort = Builders<HousingListing>.Sort.Descending(x => x.DatePosted);
            if (filters.SortBy?.ToLower() == "price")
                sort = filters.SortOrder?.ToLower() == "asc"
                    ? Builders<HousingListing>.Sort.Ascending(x => x.Price)
                    : Builders<HousingListing>.Sort.Descending(x => x.Price);

            // FIX: Use _housingListings instead of _context.HousingListings
            return await _housingListings.Find(filter).Sort(sort).ToListAsync();
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