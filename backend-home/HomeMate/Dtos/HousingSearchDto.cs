using System;
using System.Collections.Generic;

namespace HomeMate.Dtos
{
    public class HousingSearchDto
    {
        public string? ZipCode { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public string? PropertyType { get; set; }
        
        // Amenities filters
        public bool PetFriendly { get; set; }
        public bool Furnished { get; set; }
        public bool Parking { get; set; }
        public bool Gym { get; set; }
        public bool Pool { get; set; }
        public bool Balcony { get; set; }
        
        // Advanced filters
        public List<string> Amenities { get; set; } = new List<string>();
        public List<string> Keywords { get; set; } = new List<string>();
        
        public DateTime? AvailableFrom { get; set; }
        
        // Sorting and pagination
        public string SortBy { get; set; } = "date-desc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        
        // Location filters
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public int? RadiusMiles { get; set; }
        
        // Additional filters
        public bool? IsFeatured { get; set; }
        public decimal? MinSquareFeet { get; set; }
        public decimal? MaxSquareFeet { get; set; }
        
        public List<string> ExcludeIds { get; set; } = new List<string>();
        public List<string> IncludeIds { get; set; } = new List<string>();
    }

    public class HousingListingDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public int Price { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public int SquareFeet { get; set; }
        public bool PetFriendly { get; set; }
        public bool Furnished { get; set; }
        public List<string> Amenities { get; set; } = new();
        public List<string> Images { get; set; } = new();
        public string Description { get; set; } = string.Empty;
        public DateTime DatePosted { get; set; }
        public bool IsFeatured { get; set; }
        public string ContactInfo { get; set; } = string.Empty;
    }

    public class CreateHousingListingDto
    {
        public string Title { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public int Price { get; set; }
        public int Bedrooms { get; set; }
        public int Bathrooms { get; set; }
        public int SquareFeet { get; set; }
        public bool PetFriendly { get; set; }
        public bool Furnished { get; set; }
        public List<string> Amenities { get; set; } = new();
        public List<string> Images { get; set; } = new();
        public string Description { get; set; } = string.Empty;
        public string ContactInfo { get; set; } = string.Empty;
    }
}