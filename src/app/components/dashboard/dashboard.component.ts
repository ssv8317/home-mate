import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HousingService } from '../../services/housing.service';
import { MatchService } from '../../services/match.service'; // <-- Add this import
import { User } from '../../models/user.model';
import { HousingListing } from '../../models/housing.model';
import { MatchResponse, RoommateProfileView } from '../../models/match.model'; // <-- Add this import
// import { SearchFilters } from '../../models/housing.model'; // <-- Removed because it does not exist

// Matched Profile Interface
export interface MatchedProfile {
  id: string;
  fullName: string;
  age: number;
  occupation: string;
  budgetRange: string;
  locationPreference: string;
  matchPercentage: number;
  sharedInterests: string[];
  profileImage?: string;
  lastActive: Date;
}

// Chat Message Interface
export interface ChatMessage {
  id: string;
  profileId: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

// Define tab type separately for better type safety
export type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  zipForm: FormGroup;
  housingSearchForm: FormGroup;
  
  // Tab management - updated to use the TabType
  public activeTab: TabType = 'home';
  public mobileMenuOpen = false;
  
  // Housing search properties
  housingResults: HousingListing[] = [];
  featuredListings: HousingListing[] = [];
  isSearchingHousing = false;
  hasSearchedHousing = false;
  
  // Matched Profiles properties
  matchedProfiles: MatchedProfile[] = [];
  selectedProfile: MatchedProfile | null = null;
  newMessage = '';
  chatMessages: ChatMessage[] = [];
  public isTyping = false;
  
  // Legacy properties for roommate search
  matches: any[] = [];
  isSearching = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private housingService: HousingService,
    private matchService: MatchService, // <-- Inject MatchService
    private router: Router
  ) {
    // Legacy roommate search form
    this.zipForm = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // New housing search form
    this.housingSearchForm = this.fb.group({
      zipCode: ['', [Validators.pattern(/^\d{5}$/)]],
      maxPrice: [''],
      bedrooms: [''],
      petFriendly: [false],
      furnished: [false],
      parking: [false],
      gym: [false]
    });
  }

  ngOnInit(): void {
    this.checkOrRedirectProfile();
    this.loadFeaturedListings();
    this.initializeChatMessages();
  }

  /**
   * Checks if the user has a roommate profile.
   * If not, redirects to profile setup.
   * If yes, loads matched profiles.
   */
  private checkOrRedirectProfile(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }
      if (!user.id) {
        this.router.navigate(['/profile-setup']);
        return;
      }
      // Only call if user.id is defined
      this.matchService.getRoommateProfile(user.id as string).subscribe({
        next: (profile) => {
          if (!profile) {
            this.router.navigate(['/profile-setup']);
          } else {
            this.loadMatchedProfiles();
          }
        },
        error: (err) => {
          // Always redirect to profile setup on error (e.g., 404)
          this.router.navigate(['/profile-setup']);
        }
      });
    });
  }

  private loadCurrentUser(): void {
    // Get user from localStorage first
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        console.log('User loaded from localStorage:', this.currentUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Also try from AuthService
    if (this.authService.currentUser$) {
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            console.log('User loaded from AuthService:', this.currentUser);
          }
        },
        error: (error) => {
          console.error('Error getting user from AuthService:', error);
        }
      });
    }

    // Try to get fresh user data from backend (will work when backend is ready)
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          console.log('Fresh user data loaded:', user);
          // this.loadMatchedProfiles(); // <-- Removed to prevent double loading
        }
      },
      error: (error) => {
        console.log('Backend not ready yet for fresh user data:', error);
      }
    });
  }

  private loadFeaturedListings(): void {
    this.housingService.getFeaturedListings().subscribe({
      next: (listings) => {
        this.featuredListings = listings;
      },
      error: (error) => {
        console.error('Error loading featured listings:', error);
      }
    });
  }

  private loadMatchedProfiles(): void {
    if (!this.currentUser) return;
    // Pass currentUser.interests if available, otherwise empty array
    const userInterests = (this.currentUser as any).interests || [];
    this.matchService.getMatches(this.currentUser.id!, userInterests).subscribe({
      next: (matches: MatchResponse[]) => {
        console.log('Matches from backend:', matches); // <-- Debug log
        this.matchedProfiles = matches.map(m => ({
          id: m.profile.id,
          fullName: m.profile.fullName,
          age: m.profile.age,
          occupation: m.profile.occupation,
          budgetRange: m.profile.budgetRange,
          locationPreference: m.profile.locationPreference,
          matchPercentage: m.compatibilityScore,
          sharedInterests: m.profile.sharedInterests,
          profileImage: m.profile.profilePictures?.[0] || '',
          lastActive: new Date(m.profile.updatedAt)
        }));
        if (this.matchedProfiles.length === 0) {
          console.warn('No matched profiles found for this user.');
        }
      },
      error: (error) => {
        console.error('Error loading matched profiles:', error);
        this.matchedProfiles = [];
      }
    });
  }

  private initializeChatMessages(): void {
    // Initialize sample chat messages for each profile
    this.chatMessages = [
      {
        id: '1',
        profileId: '1',
        text: 'Hi! I saw we matched based on our apartment preferences. Are you still looking for a roommate?',
        isOwn: false,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: '2',
        profileId: '1',
        text: 'Yes! I love that we both prefer downtown and are okay with pets. Have you found any good apartments yet?',
        isOwn: true,
        timestamp: new Date(Date.now() - 3000000) // 50 minutes ago
      },
      {
        id: '3',
        profileId: '2',
        text: 'Hey! Fellow software engineer here. I noticed we have similar budgets and both work in tech. Want to chat about potential apartments?',
        isOwn: false,
        timestamp: new Date(Date.now() - 7200000) // 2 hours ago
      },
      {
        id: '4',
        profileId: '2',
        text: 'Absolutely! I\'ve been looking at some places in the tech district. Would love to share some listings with you.',
        isOwn: true,
        timestamp: new Date(Date.now() - 6900000) // 1 hour 55 minutes ago
      },
      {
        id: '5',
        profileId: '3',
        text: 'Hi there! I see we\'re both looking for places near campus. I\'m a marketing specialist and love the social aspect of shared living!',
        isOwn: false,
        timestamp: new Date(Date.now() - 10800000) // 3 hours ago
      }
    ];
  }

  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Matched Profiles methods
  selectProfile(profile: MatchedProfile): void {
    this.selectedProfile = profile;
  }

  getChatMessages(profileId: string): ChatMessage[] {
    return this.chatMessages.filter(msg => msg.profileId === profileId);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedProfile) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      profileId: this.selectedProfile.id,
      text: this.newMessage.trim(),
      isOwn: true,
      timestamp: new Date()
    };

    this.chatMessages.push(message);
    this.newMessage = '';

    // Show typing indicator
    this.isTyping = true;

    // Simulate response after a delay
    setTimeout(() => {
      this.isTyping = false;
      
      const responses = [
        "That sounds great! I'd love to learn more.",
        "I'm definitely interested. When would be a good time to meet?",
        "Perfect! I was thinking the same thing.",
        "That apartment looks amazing! Should we schedule a viewing?",
        "I agree! Let's definitely discuss this further.",
        "Awesome! I think we'd make great roommates.",
        "That's exactly what I was looking for too!",
        "I love your enthusiasm! Let's make this happen.",
        "Great idea! I'm excited to move forward with this.",
        "That works perfectly for me. What's the next step?"
      ];
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        profileId: this.selectedProfile!.id,
        text: responses[Math.floor(Math.random() * responses.length)],
        isOwn: false,
        timestamp: new Date()
      };
      
      this.chatMessages.push(responseMessage);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  // Housing search methods
  searchHousing(): void {
    this.isSearchingHousing = true;
    this.hasSearchedHousing = true;

    const formValue = this.housingSearchForm.value;
    const filters: any = {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };

    // Add amenities based on checkboxes
    if (formValue.parking) filters.amenities?.push('Parking');
    if (formValue.gym) filters.amenities?.push('Gym');

    this.housingService.searchHousing(filters).subscribe({
      next: (results) => {
        this.housingResults = results;
        this.isSearchingHousing = false;
      },
      error: (error) => {
        console.error('Housing search error:', error);
        this.isSearchingHousing = false;
      }
    });
  }

  onSortChange(event: any): void {
    const [sortBy, sortOrder] = event.target.value.split('-');
    const currentFilters = this.getCurrentHousingFilters();
    currentFilters.sortBy = sortBy as any;
    currentFilters.sortOrder = sortOrder as any;

    this.housingService.searchHousing(currentFilters).subscribe({
      next: (results) => {
        this.housingResults = results;
      }
    });
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false;
  }

  private getCurrentHousingFilters(): any {
    const formValue = this.housingSearchForm.value;
    return {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: []
    };
  }

  // Legacy roommate search methods (keeping for backward compatibility)
  searchRoommates(): void {
    if (this.zipForm.valid) {
      this.isSearching = true;
      this.errorMessage = '';
      this.hasSearched = true;

      const zipCode = this.zipForm.get('zipCode')?.value;
      console.log('Searching for roommates in ZIP:', zipCode);
      
      // Simulate search
      setTimeout(() => {
        this.matches = [];
        this.isSearching = false;
        this.errorMessage = 'Roommate search functionality will be added in future updates.';
      }, 1000);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}