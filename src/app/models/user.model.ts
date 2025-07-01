export interface User {
  id?: string;
  fullName: string;
  email: string;
  age: number;
  gender: string;
  occupation: string;
  college?: string;
  sleepSchedule: string;
  cleanlinessLevel: string; // Changed back to string to match backend
  smokingPreference: string;
  petFriendly: string;      // Changed back to string to match backend
  budgetRange: string;
  locationPreference: string;
  aboutMe: string;
  createdAt?: Date;         // Added this field
  zipCode: string;         // Added zip code field
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  occupation: string;
  college?: string;
  sleepSchedule: string;
  cleanlinessLevel: string; // Changed to string
  smokingPreference: string;
  petFriendly: string;      // Changed to string
  budgetRange: string;
  locationPreference: string;
  aboutMe: string;
  zipCode: string;         // Added zip code field
}

export interface AuthResponse {
  token?: string; // Optional since register doesn't return token
  user: User;
}

// Add the RoommateMatch interface for dashboard
export interface RoommateMatch {
  user: User;
  matchPercentage: number;
  sharedPreferences: string[];
}