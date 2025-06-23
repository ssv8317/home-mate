import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoommateProfile, RoommateProfileView, MatchResponse, UserAction, SwipeRequest } from '../models/match.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'https://localhost:56636/api/match';

  constructor(private http: HttpClient) {}

  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/potential/${userId}`).pipe(
      map(matches => matches.map(match => ({
        ...match,
        profile: {
          ...match.profile,
          fullName: match.profile.displayName || '',
          budgetRange: (typeof match.profile.budgetMin !== 'undefined' && typeof match.profile.budgetMax !== 'undefined')
            ? `$${match.profile.budgetMin} - $${match.profile.budgetMax}` : '',
          locationPreference: match.profile.preferredLocations ? match.profile.preferredLocations.join(', ') : '',
          aboutMe: match.profile.bio || '',
          sharedInterests: match.profile.interests || [],
        } as RoommateProfileView,
        matchPercentage: match.compatibilityScore // For template compatibility
      })))
    );
  }

  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.apiUrl}/swipe/${userId}`, request);
  }

  getMatches(userId: string): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/matches/${userId}`).pipe(
      map(matches => matches.map(match => ({
        ...match,
        profile: {
          ...match.profile,
          fullName: match.profile.displayName || '',
          budgetRange: (typeof match.profile.budgetMin !== 'undefined' && typeof match.profile.budgetMax !== 'undefined')
            ? `$${match.profile.budgetMin} - $${match.profile.budgetMax}` : '',
          locationPreference: match.profile.preferredLocations ? match.profile.preferredLocations.join(', ') : '',
          aboutMe: match.profile.bio || '',
          sharedInterests: match.profile.interests || [],
        } as RoommateProfileView,
        matchPercentage: match.compatibilityScore
      })))
    );
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile> {
    return this.http.get<RoommateProfile>(`${this.apiUrl}/profile/${userId}`);
  }

  createOrUpdateProfile(userId: string, profile: RoommateProfile): Observable<RoommateProfile> {
    return this.http.post<RoommateProfile>(`${this.apiUrl}/profile/${userId}`, profile);
  }

  // Helper methods
  getCompatibilityText(score: number): string {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  }

  getCompatibilityColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }
}

// Re-export all types and enums for convenience
export type { MatchResponse, RoommateProfile, RoommateProfileView, SwipeRequest };
export { UserAction };