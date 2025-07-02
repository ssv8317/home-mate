
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HousingService } from '../../services/housing.service';
import { MatchService } from '../../services/match.service';
import { MessageService } from '../../services/message.service';
import { User } from '../../models/user.model';
import { HousingListing } from '../../models/housing.model';
import { MatchResponse, UserAction } from '../../models/match.model';

// Matched Profile Interface
export interface MatchedProfile {
  id: string;
  userId: string;
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
  senderId: string;
  receiverId: string;
}

// Define tab type
export type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, AfterViewChecked {
  unreadMessageCount: number = 0;
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  currentUser: User | null = null;
  zipForm: FormGroup;
  housingSearchForm: FormGroup;

  public activeTab: TabType = 'home';
  public mobileMenuOpen = false;

  housingResults: HousingListing[] = [];
  featuredListings: HousingListing[] = [];
  isSearchingHousing = false;
  hasSearchedHousing = false;

  matchedProfiles: MatchedProfile[] = [];
  selectedProfile: MatchedProfile | null = null;
  newMessage = '';
  chatMessages: ChatMessage[] = [];
  public isTyping = false;
  
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private housingService: HousingService,
    private matchService: MatchService,
    private messageService: MessageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.zipForm = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

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
    this.loadUnreadMessageCount();
  }

  loadUnreadMessageCount(): void {
    if (!this.currentUser || !this.currentUser.id) return;
    this.messageService.getUnreadMessageCount(this.currentUser.id).subscribe({
      next: (count: number) => { this.unreadMessageCount = count; },
      error: () => { this.unreadMessageCount = 0; }
    });
  }

  ngAfterViewInit(): void {
    // this.scrollToBottom(); // Remove auto-scroll to allow manual up/down scrolling
  }

  ngAfterViewChecked(): void {
    // this.scrollToBottom(); // Remove auto-scroll to allow manual up/down scrolling
  }

  private checkOrRedirectProfile(): void {
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
      if (!user || !user.id) {
        this.router.navigate(['/login']);
        return;
      }
      this.loadMatchedProfiles();
    });
  }

  private loadFeaturedListings(): void {
    this.housingService.getFeaturedListings().subscribe({
      next: (listings) => { this.featuredListings = listings; },
      error: (error) => { console.error('Error loading featured listings:', error); }
    });
  }

  private loadMatchedProfiles(): void {
    if (!this.currentUser) return;
    const userInterests = (this.currentUser as any).interests || [];
    this.matchService.getPotentialMatches(this.currentUser.id!, userInterests).subscribe({
      next: (matches) => {
        this.matchedProfiles = matches.map(m => ({
          id: m.profile.id,
          userId: m.profile.userId,
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
      },
      error: (error) => {
        console.error('Error loading matched profiles:', error);
        this.matchedProfiles = [];
      }
    });
  }

  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2);
  }

  selectProfile(profile: MatchedProfile): void {
    this.selectedProfile = profile;
    this.loadChatMessages();
  }

  private scrollToBottom(): void {
    try {
      setTimeout(() => {
        if (this.messagesContainer && this.messagesContainer.nativeElement) {
          this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
      }, 50); // Delay to ensure DOM is rendered
    } catch (err) {
      // Errors can happen if the element isn't visible, so we can ignore them.
    }
  }

  loadChatMessages(): void {
    if (!this.selectedProfile || !this.currentUser) return;
    this.messageService.getConversation(this.currentUser.id!, this.selectedProfile.userId).subscribe({
      next: (messages: any[]) => {
        this.chatMessages = messages.map(msg => {
          const senderId = msg.SenderId || msg.senderId;
          const isOwn = senderId === this.currentUser!.id;
          return {
            id: msg._id || msg.id,
            profileId: isOwn ? (msg.ReceiverId || msg.receiverId) : senderId,
            text: msg.Content || msg.content,
            isOwn: isOwn,
            timestamp: new Date(msg.SentAt || msg.sentAt),
            senderId: senderId,
            receiverId: msg.ReceiverId || msg.receiverId
          };
        });
        this.cdr.detectChanges();
        // this.scrollToBottom(); // Remove auto-scroll to allow manual up/down scrolling
        if (typeof this.loadUnreadMessageCount === 'function') {
          this.loadUnreadMessageCount();
        }
      },
      error: () => { this.chatMessages = []; }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedProfile || !this.currentUser) return;

    const content = this.newMessage.trim();
    this.messageService.sendMessage(this.currentUser.id!, this.selectedProfile.userId, content).subscribe({
      next: (msg: any) => {
        const senderId = msg.SenderId || msg.senderId;
        const isOwn = senderId === this.currentUser!.id;
        this.chatMessages.push({
            id: msg._id || msg.id,
            profileId: isOwn ? (msg.ReceiverId || msg.receiverId) : senderId,
            text: msg.Content || msg.content,
            isOwn: isOwn,
            timestamp: new Date(msg.SentAt || msg.sentAt),
            senderId: senderId,
            receiverId: msg.ReceiverId || msg.receiverId
        });
        this.newMessage = '';
        this.cdr.detectChanges();
        this.scrollToBottom(); // Only scroll on send
      }
    });
  }

  getLastMessageTextForProfile(profileId: string): string {
    if (!this.chatMessages) return '';
    // Find the last message related to this profile, regardless of sender
    const lastMessage = [...this.chatMessages].reverse().find(msg => 
        (msg.senderId === this.currentUser?.id && msg.receiverId === profileId) ||
        (msg.senderId === profileId && msg.receiverId === this.currentUser?.id)
    );
    return lastMessage ? lastMessage.text : 'No messages yet.';
  }

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
    };
    if (formValue.parking) filters.amenities?.push('Parking');
    if (formValue.gym) filters.amenities?.push('Gym');
    this.housingService.searchHousing(filters).subscribe({
        next: (results) => { this.housingResults = results; this.isSearchingHousing = false; },
        error: (error) => { console.error('Housing search error:', error); this.isSearchingHousing = false; }
    });
  }
    
  onSortChange(event: any): void {
     // Implement your sorting logic here
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false;
  }
    
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}