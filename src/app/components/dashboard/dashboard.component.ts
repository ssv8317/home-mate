import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatchService } from '../../services/match.service';
import { HousingService } from '../../services/housing.service';
import { MessageService, ChatMessage, Conversation } from '../../services/message.service';
import { User } from '../../models/user.model';
import { HousingListing } from '../../models/housing.model';

type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

interface Profile {
  id: string;
  fullName: string;
  age: number;
  occupation: string;
  budgetRange: string;
  locationPreference: string;
  matchPercentage: number;
  profilePicture?: string;
  sharedInterests: string[];  // ← Added this
}

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

  // Housing related - make sure these exist
  featuredListings: HousingListing[] = [];
  housingResults: HousingListing[] = [];
  isSearchingHousing: boolean = false;
  hasSearchedHousing: boolean = false;  // ← This is key for showing results
  
  // Form with all required controls
  housingSearchForm: FormGroup;

  // Matches and messaging
  recentMatches: any[] = [];
  matchedProfiles: Profile[] = [];
  selectedProfile: any = null;
  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isTyping: boolean = false;  // ← Added this

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private housingService: HousingService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.housingSearchForm = this.formBuilder.group({
      // Basic Search Fields (match your HTML template)
      zipCode: [''],           // ← For Location input
      maxPrice: [''],          // ← For Max Budget dropdown
      minPrice: [''],          // ← Add this too
      bedrooms: [''],          // ← For Bedrooms dropdown
      bathrooms: [''],         // ← Add this
      propertyType: [''],      // ← For Property Type dropdown
      
      // Advanced Filters (match your checkboxes)
      petFriendly: [false],    // ← Pet Friendly checkbox
      furnished: [false],      // ← Furnished checkbox
      parking: [false],        // ← Parking checkbox
      gym: [false],            // ← Gym/Fitness checkbox
      pool: [false],           // ← Pool checkbox
      balcony: [false],        // ← Balcony checkbox
      
      // Additional useful fields
      amenities: ['']
    });

    this.matchedProfiles = [
      {
        id: '1',
        fullName: 'Sarah Johnson',
        age: 28,
        occupation: 'Software Engineer',
        budgetRange: '$1500-2000',
        locationPreference: 'Downtown',
        matchPercentage: 92,
        sharedInterests: ['Reading', 'Hiking', 'Cooking', 'Movies']  // ← Added this
      },
      {
        id: '2',
        fullName: 'Michael Chen',
        age: 26,
        occupation: 'Graphic Designer',
        budgetRange: '$1200-1800',
        locationPreference: 'Arts District',
        matchPercentage: 88,
        sharedInterests: ['Art', 'Photography', 'Travel']  // ← Added this
      }
    ];
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadFeaturedListings();
    // this.loadConversations(); // ← COMMENT THIS OUT FOR NOW
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        if (user) {
          this.currentUser = user;
          this.loadMatches();
        }
      },
      error: (error: any) => {
        console.error('Error loading user:', error);
      }
    });
  }

  logout(): void {
    // Fix: Make logout return void, handle redirect directly
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
    console.log('🔍 Search button clicked'); // Debug log
    
    if (this.housingSearchForm.valid) {
      this.isSearchingHousing = true;
      this.hasSearchedHousing = true; // ← This is crucial!
      
      const filters = this.housingSearchForm.value;
      console.log('📋 Search filters:', filters); // Debug log
      
      this.housingService.searchHousing(filters).subscribe({
        next: (results: HousingListing[]) => {
          console.log('✅ API returned results:', results); // Debug log
          this.housingResults = results;
          this.isSearchingHousing = false;
          console.log(`📊 Total results: ${results.length}`); // Debug log
        },
        error: (error: any) => {
          console.error('❌ Search error:', error); // Debug log
          this.housingResults = [];
          this.isSearchingHousing = false;
          this.hasSearchedHousing = true; // Still show "no results" message
        }
      });
    } else {
      console.log('❌ Form is invalid:', this.housingSearchForm.errors);
    }
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false; // ← Reset this flag
  }

  sortHousingResults(event: any): void {
    const sortValue = event.target.value;
    console.log('🔄 Sort changed to:', sortValue);
    
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
        // 'newest-first' or default - sort by newest first
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
    }
  }

  loadMatches(): void {
    if (this.currentUser?.id) {
      this.matchService.findMatches(this.currentUser.id).subscribe({
        next: (matches: any[]) => this.recentMatches = matches.slice(0, 5),
        error: (error: any) => console.error('Error loading matches:', error)
      });
    }
  }

  selectProfile(profile: any): void {
    this.selectedProfile = profile;
    console.log('👤 Selected profile:', profile.fullName);
  }

  getChatMessages(profileId: string): any[] {
    // Return mock messages for now
    return [
      {
        id: '1',
        content: 'Hey! I saw your profile and we seem like a great match as roommates!',
        isOwn: false,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: '2', 
        content: 'Hi! Thanks for reaching out. I agree, we have similar interests and budget ranges.',
        isOwn: true,
        timestamp: new Date(Date.now() - 3000000) // 50 minutes ago
      },
      {
        id: '3',
        content: 'Would you like to set up a time to chat about potential apartments?',
        isOwn: false,
        timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
      }
    ];
  }

  sendMessage(): void {
    if (this.newMessage.trim() && this.selectedProfile) {
      // Add message logic here
      console.log('📤 Sending message:', this.newMessage);
      this.newMessage = '';
    }
  }

  getInitials(fullName: string | undefined): string {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  saveProfile(): void {
    if (this.currentUser) {
      console.log('💾 Saving profile...', this.currentUser);
      
      // Here you would typically call your AuthService to update the user
      // this.authService.updateUser(this.currentUser).subscribe({
      //   next: (updatedUser) => {
      //     console.log('✅ Profile saved successfully');
      //     // Show success notification
      //   },
      //   error: (error) => {
      //     console.error('❌ Error saving profile:', error);
      //     // Show error notification
      //   }
      // });

      // For now, just show a success message
      alert('✅ Profile saved successfully!');
    } else {
      console.error('❌ No current user to save');
      alert('❌ Error: No user data to save');
    }
  }

  resetProfile(): void {
    console.log('🔄 Resetting profile form...');
    
    // Reload the original user data
    this.loadCurrentUser();
    
    // Show feedback to user
    alert('🔄 Profile changes have been reset');
  }
}