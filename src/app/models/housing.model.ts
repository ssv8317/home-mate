export interface HousingListing {
  id: string;
  title: string;
  address: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;  // ← Add this property
  petFriendly: boolean;
  furnished: boolean;
  amenities: string[];
  images: string[];
  description: string;
  datePosted: Date;
  isFeatured: boolean;
  contactInfo: string;
  ownerId: string;
  location: string;
  createdAt: Date;
  landlord?: {
    name: string;
    phone?: string;
    email?: string;
    rating?: number;
  };
}

export interface HousingSearchFilters {
  zipCode?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number[];
  bathrooms?: number;
  petFriendly?: boolean;
  furnished?: boolean;
  amenities?: string[];
  sortBy?: string;
  sortOrder?: string;
}