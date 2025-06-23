export interface RoommateProfile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  gender: string;
  occupation: string;
  bio: string;
  profilePictures: string[];
  
  // Budget & Location
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  
  // Lifestyle (1-5 scale)
  cleanliness: number;
  socialLevel: number;
  noiseLevel: number;
  smokingOk: boolean;
  petsOk: boolean;
  
  interests: string[];
  isActive: boolean;
  createdAt: Date;
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
  matchedAt?: Date;
  createdAt: Date;
}

export interface MatchResponse {
  id: string;
  profile: RoommateProfile;
  compatibilityScore: number;
  isNewMatch: boolean;
}

export interface SwipeRequest {
  profileId: string;
  action: UserAction;
}

export enum MatchStatus {
  Pending = 0,
  Matched = 1,
  Rejected = 2,
  Expired = 3
}

export enum UserAction {
  None = 0,
  Like = 1,
  Pass = 2,
  SuperLike = 3
}