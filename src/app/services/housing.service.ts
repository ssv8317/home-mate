import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HousingListing } from '../models/housing.model';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private apiUrl = 'https://localhost:56636/api'; // ← Fix this URL

  constructor(private http: HttpClient) {}

  getFeaturedListings(): Observable<HousingListing[]> {
    return this.http.get<HousingListing[]>(`${this.apiUrl}/housing/featured`);
  }

  searchHousing(filters: any): Observable<HousingListing[]> {
    // Debug log to check what is being sent
    console.log('searchHousing filters:', filters);
    const searchParams = new HttpParams({
      fromObject: {
        zipCode: filters.zipCode || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        bedrooms: filters.bedrooms || '',
        bathrooms: filters.bathrooms || '',
        petFriendly: filters.petFriendly ? 'true' : 'false',
        furnished: filters.furnished ? 'true' : 'false',
        amenities: filters.amenities || ''
      }
    });

    return this.http.get<HousingListing[]>(`${this.apiUrl}/housing/search`, { params: searchParams });
  }
}