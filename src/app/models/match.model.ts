export interface RoommateProfile {
  id: string; // maps to _id in MongoDB
  userId: string;
  displayName: string;
  age: number;
  gender: string;
  occupation: string;
  bio: string;
  profilePictures: string[];
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  cleanliness: number;
  socialLevel: number;
  noiseLevel: number;
  smokingOk: boolean;
  petsOk: boolean;
  interests: string[];
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

// Extended profile for frontend-mapped fields
export interface RoommateProfileView extends RoommateProfile {
  fullName: string;
  budgetRange: string;
  locationPreference: string;
  aboutMe: string;
  sharedInterests: string[];
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  profileId1: string;
  profileId2: string;
  compatibilityScore: number;
  status: MatchStatus;
  user1Action: UserAction;
  user2Action: UserAction;
  matchedAt?: string; // ISO date string or null
  createdAt: string;  // ISO date string
}

export enum MatchStatus {
  Pending = 'Pending',
  Matched = 'Matched',
  Rejected = 'Rejected',
  Expired = 'Expired'
}

export enum UserAction {
  None = 0,
  Like = 1,
  Pass = 2,
  SuperLike = 3
}

// Use RoommateProfileView for mapped profiles in responses
export interface MatchResponse {
  id: string;
  profile: RoommateProfileView;
  compatibilityScore: number;
  isNewMatch: boolean;
}

export interface SwipeRequest {
  profileId: string;
  action: UserAction;
}