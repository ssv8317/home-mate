import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HousingService } from '../../services/housing.service';
import { MatchService } from '../../services/match.service'; // <-- Add this import
import { MessageService, ChatMessage as ApiChatMessage } from '../../services/message.service';
import { User } from '../../models/user.model';
import { HousingListing } from '../../models/housing.model';
import { MatchResponse, RoommateProfileView, UserAction } from '../../models/match.model'; // <-- Add UserAction import
// import { SearchFilters } from '../../models/housing.model'; // <-- Removed because it does not exist

// Matched Profile Interface
export interface MatchedProfile {
  id: string;
  userId: string; // <-- Add userId for correct messaging
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
  senderId: string; // Added for debug
  receiverId: string; // Added for debug
}

// Define tab type separately for better type safety
export type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

// Define UserAction type for swipe actions
// (Removed local UserAction type to use the imported one from match.model)

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, AfterViewChecked {
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
  public isTyping = false;
  
  // Legacy properties for roommate search
  matches: any[] = [];
  isSearching = false;
  hasSearched = false;
  errorMessage = '';

  // Add a property to track swiped profiles
  swipedProfileIds: Set<string> = new Set();

  // Chat messages property
  chatMessages: ChatMessage[] = [];

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private housingService: HousingService,
    private matchService: MatchService, // <-- Inject MatchService
    private messageService: MessageService, // <-- Inject MessageService
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
  }

  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  /**
   * Checks if the user is logged in and loads matched profiles.
   * No longer redirects to profile setup, since all info is collected at sign up.
   */
  private checkOrRedirectProfile(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (!user || !user.id) {
        this.router.navigate(['/login']);
        return;
      }
      // Directly load matched profiles
      this.loadMatchedProfiles();
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
    const userInterests = (this.currentUser as any).interests || [];
    this.matchService.getPotentialMatches(this.currentUser.id!, userInterests).subscribe({
      next: (matches: MatchResponse[]) => {
        this.matchedProfiles = matches
          .filter(m => !this.swipedProfileIds.has(m.profile.id)) // Exclude swiped profiles
          .map(m => ({
            id: m.profile.id,
            userId: m.profile.userId, // <-- Use userId from RoommateProfileView
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
    this.loadChatMessages();
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer && this.chatContainer.nativeElement) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  loadChatMessages(): void {
    if (!this.selectedProfile || !this.currentUser) return;
    this.messageService.getConversation(this.currentUser.id!, this.selectedProfile.userId).subscribe({
      next: (messages: any[]) => {
        this.chatMessages = messages.map((msg: any) => {
          const senderId = msg.SenderId || msg.senderId || '';
          const receiverId = msg.ReceiverId || msg.receiverId || '';
          const isOwn = senderId === this.currentUser!.id;
          const profileId = isOwn ? receiverId : senderId;
          return {
            id: msg._id || msg.id || '',
            profileId,
            text: msg.Content || msg.content || '',
            isOwn,
            timestamp: new Date(msg.SentAt || msg.sentAt || Date.now()),
            senderId,
            receiverId
          };
        });
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        this.chatMessages = [];
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedProfile || !this.currentUser) return;
    const content = this.newMessage.trim();
    this.messageService.sendMessage(this.currentUser.id!, this.selectedProfile.userId, content).subscribe({
      next: (msg: any) => {
        const senderId = msg.SenderId || msg.senderId || '';
        const receiverId = msg.ReceiverId || msg.receiverId || '';
        const isOwn = senderId === this.currentUser!.id;
        const profileId = isOwn ? receiverId : senderId;
        this.chatMessages.push({
          id: msg._id || msg.id || '',
          profileId,
          text: msg.Content || msg.content || '',
          isOwn,
          timestamp: new Date(msg.SentAt || msg.sentAt || Date.now()),
          senderId,
          receiverId
        });
        this.newMessage = '';
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
      }
    });
  }

  /**
   * Returns the last message text for a given profile ID from chatMessages.
   * If no message is found, returns an empty string.
   */
  getLastMessageTextForProfile(profileId: string): string {
    // Assuming chatMessages is an array of objects with profileId and text
    if (!this.chatMessages || !Array.isArray(this.chatMessages)) {
      return '';
    }
    // Find the last message for the given profileId
    const messages = this.chatMessages.filter((msg: any) => msg.profileId === profileId);
    if (messages.length === 0) {
      return '';
    }
    return messages[messages.length - 1].text || '';
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

  // Swipe actions
  swipeRight(profile: MatchedProfile): void {
    // Mark as swiped
    this.swipedProfileIds.add(profile.id);
    // Optionally, call backend to record swipe
    this.matchService.swipe(this.currentUser!.id!, {
      profileId: profile.id,
      action: 'like' as unknown as UserAction
    }).subscribe({
      next: () => {
        // After swipe, reload potential matches
        this.loadMatchedProfiles();
      },
      error: (err) => {
        console.error('Swipe error:', err);
      }
    });
  }

  swipeLeft(profile: MatchedProfile): void {
    // Mark as swiped
    this.swipedProfileIds.add(profile.id);
    // Optionally, call backend to record swipe
    this.matchService.swipe(this.currentUser!.id!, {
      profileId: profile.id,
      action: 'pass' as unknown as UserAction
    }).subscribe({
      next: () => {
        // After swipe, reload potential matches
        this.loadMatchedProfiles();
      },
      error: (err) => {
        console.error('Swipe error:', err);
      }
    });
  }

  get noConversationSelected(): boolean {
    return this.selectedProfile === null;
  }
}

// Backend message interface for PascalCase properties
interface BackendChatMessage {
  _id: string;
  SenderId: string;
  ReceiverId: string;
  Content: string;
  SentAt: string;
}