import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Simple interface for now
export interface RoommateMatch {
  user: any;
  matchPercentage: number;
  sharedPreferences: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'https://localhost:56636/api'; // ← Fix this URL

  constructor(private http: HttpClient) {}

  findMatches(zipCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/matches/${zipCode}`);
  }

  getMatchDetails(matchId: string): Observable<RoommateMatch> {
    return this.http.get<RoommateMatch>(`${this.apiUrl}/matches/${matchId}`);
  }

  likeProfile(profileId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/like`, { profileId });
  }

  passProfile(profileId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/pass`, { profileId });
  }
}