using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;

namespace HomeMate.Models
{
    public class HousingListing
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonElement("title")]
        public string Title { get; set; } = string.Empty;

        [BsonElement("address")]
        public string Address { get; set; } = string.Empty;

        [BsonElement("zipCode")]
        public string ZipCode { get; set; } = string.Empty;

        [BsonElement("price")]
        public decimal Price { get; set; }

        [BsonElement("bedrooms")]
        public int Bedrooms { get; set; }

        [BsonElement("bathrooms")]
        public int Bathrooms { get; set; }

        [BsonElement("squareFeet")]
        public int SquareFeet { get; set; }

        [BsonElement("petFriendly")]
        public bool PetFriendly { get; set; } = false;

        [BsonElement("furnished")]
        public bool Furnished { get; set; } = false;

        [BsonElement("amenities")]
        public List<string> Amenities { get; set; } = new();

        [BsonElement("images")]
        public List<string> Images { get; set; } = new();

        [BsonElement("description")]
        public string Description { get; set; } = string.Empty;

        [BsonElement("datePosted")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime DatePosted { get; set; }

        [BsonElement("isFeatured")]
        public bool IsFeatured { get; set; }

        [BsonElement("contactInfo")]
        public string ContactInfo { get; set; } = string.Empty;

        [BsonElement("ownerId")]
        public string OwnerId { get; set; } = string.Empty;

        public string Location { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public Landlord? Landlord { get; set; } // ← Add this property
    }

    public class Landlord
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public double? Rating { get; set; }
    }

    public class HousingSearchFilters
    {
        public string? ZipCode { get; set; }
        public int? MinPrice { get; set; }
        public int? MaxPrice { get; set; }
        public List<int>? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public bool? PetFriendly { get; set; }
        public bool? Furnished { get; set; }
        public List<string>? Amenities { get; set; }
        public string? SortBy { get; set; } = "date";
        public string? SortOrder { get; set; } = "desc";
    }
}