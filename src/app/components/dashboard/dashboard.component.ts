import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatchService, MatchResponse, RoommateProfile, SwipeRequest, UserAction } from '../../services/match.service';
import { HousingService } from '../../services/housing.service';
import { MessageService, ChatMessage, Conversation } from '../../services/message.service';
import { User } from '../../models/user.model';
import { HousingListing } from '../../models/housing.model';

type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: TabType = 'home';

  // User and UI state
  currentUser: User | null = null;
  mobileMenuOpen: boolean = false;
  loading = false;
  error: string | null = null;

  // Housing related
  featuredListings: HousingListing[] = [];
  housingResults: HousingListing[] = [];
  isSearchingHousing: boolean = false;
  hasSearchedHousing: boolean = false;

  housingSearchForm: FormGroup;

  // Matches and messaging
  potentialMatches: MatchResponse[] = [];
  userMatches: MatchResponse[] = [];
  currentMatchIndex = 0;
  isLoadingMatches = false;
  showMatchModal = false;
  newMatch: MatchResponse | null = null;

  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  newMessage: string = '';
  selectedProfile: any;
  chatMessages: { [profileId: string]: any[] } = {};

  // Add this property to your component class
  matchedProfiles: any[] = [];
  public isTyping: boolean = false;

  constructor(
    private authService: AuthService,
    public matchService: MatchService, // <-- Make public for template access
    private housingService: HousingService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.housingSearchForm = this.formBuilder.group({
      zipCode: [''],
      maxPrice: [''],
      minPrice: [''],
      bedrooms: [''],
      bathrooms: [''],
      propertyType: [''],
      petFriendly: [false],
      furnished: [false],
      parking: [false],
      gym: [false],
      pool: [false],
      balcony: [false],
      amenities: ['']
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadFeaturedListings();
    this.loadPotentialMatches();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        if (user) {
          this.currentUser = user;
          this.loadUserMatches();
        }
      },
      error: (error: any) => {
        console.error('Error loading user:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  loadFeaturedListings(): void {
    this.loading = true;
    this.housingService.getFeaturedListings().subscribe({
      next: (listings: HousingListing[]) => {
        this.featuredListings = listings;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading featured listings:', error);
        this.loading = false;
      }
    });
  }

  searchHousing(): void {
    if (this.housingSearchForm.valid) {
      this.isSearchingHousing = true;
      this.hasSearchedHousing = true;
      const filters = this.housingSearchForm.value;
      this.housingService.searchHousing(filters).subscribe({
        next: (results: HousingListing[]) => {
          this.housingResults = results;
          this.isSearchingHousing = false;
        },
        error: (error: any) => {
          console.error('Search error:', error);
          this.housingResults = [];
          this.isSearchingHousing = false;
          this.hasSearchedHousing = true;
        }
      });
    }
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false;
  }

  sortHousingResults(event: any): void {
    const sortValue = event.target.value;
    if (this.housingResults.length === 0) return;
    switch (sortValue) {
      case 'price-asc':
        this.housingResults.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.housingResults.sort((a, b) => b.price - a.price);
        break;
      case 'date-desc':
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'date-asc':
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateA - dateB;
        });
        break;
      case 'bedrooms-desc':
        this.housingResults.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'bedrooms-asc':
        this.housingResults.sort((a, b) => a.bedrooms - b.bedrooms);
        break;
      case 'rating-desc':
        this.housingResults.sort((a, b) => {
          const ratingA = a.landlord?.rating || 0;
          const ratingB = b.landlord?.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
    }
  }

  // --- MATCHING SYSTEM METHODS ---

  loadPotentialMatches(): void {
    if (this.currentUser?.id) {
      this.isLoadingMatches = true;
      this.matchService.getPotentialMatches(this.currentUser.id).subscribe({
        next: (matches) => {
          this.potentialMatches = matches;
          this.currentMatchIndex = 0; // Reset index when loading new matches
          this.isLoadingMatches = false;
        },
        error: (error) => {
          console.error('Error loading potential matches:', error);
          this.isLoadingMatches = false;
        }
      });
    }
  }

  // Add swipeLeft and swipeRight for template compatibility
  swipeLeft(): void {
    this.onSwipe('dislike' as unknown as UserAction);
  }

  swipeRight(): void {
    this.onSwipe('like' as unknown as UserAction);
  }

  onSwipe(action: UserAction): void {
    if (this.currentUser && this.currentUser.id && this.potentialMatches.length > 0) {
      const currentMatch = this.potentialMatches[this.currentMatchIndex];
      const request: SwipeRequest = {
        profileId: currentMatch.profile.id,
        action: action
      };
      this.matchService.swipe(this.currentUser.id, request).subscribe({
        next: (response) => {
          if (response.isNewMatch) {
            this.newMatch = response;
            this.showMatchModal = true;
          }
          this.nextMatch();
        },
        error: (error) => {
          console.error('Error processing swipe:', error);
          this.nextMatch();
        }
      });
    }
  }

  nextMatch(): void {
    this.currentMatchIndex++;
    if (this.currentMatchIndex >= this.potentialMatches.length) {
      this.currentMatchIndex = 0;
      // Optionally reload matches or show a message
    }
  }

  getCurrentMatch(): MatchResponse | null {
    return this.potentialMatches.length > 0 && this.currentMatchIndex < this.potentialMatches.length
      ? this.potentialMatches[this.currentMatchIndex]
      : null;
  }

  loadUserMatches(): void {
    if (this.currentUser?.id) {
      this.matchService.getMatches(this.currentUser.id).subscribe({
        next: (matches: MatchResponse[]) => this.userMatches = matches,
        error: (error: any) => console.error('Error loading matches:', error)
      });
    }
  }

  // --- END MATCHING SYSTEM METHODS ---

  // Messaging and other methods remain unchanged...
  // (You can keep your getChatMessages, sendMessage, getInitials, saveProfile, resetProfile, etc.)
  getInitials(name: string | undefined | null): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }

  // Add this method to your DashboardComponent class
  selectProfile(profile: any): void {
    this.selectedProfile = profile;
  }

  getChatMessages(profileId: string): Array<{ content: string, isOwn: boolean, timestamp: Date }> {
    return this.chatMessages[profileId] || [];
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedProfile) {
      return;
    }
    const profileId = this.selectedProfile.id;
    if (!this.chatMessages[profileId]) {
      this.chatMessages[profileId] = [];
    }
    this.chatMessages[profileId].push({
      content: this.newMessage,
      timestamp: new Date(),
      isOwn: true
    });
    this.newMessage = '';
  }
}