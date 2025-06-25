import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatchService } from '../../services/match.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RoommateProfile } from '../../models/match.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  templateUrl: './profile-setup.component.html',
  styleUrls: ['./profile-setup.component.css'],
  imports: [CommonModule, ReactiveFormsModule]
})
export class ProfileSetupComponent {
  profileForm: FormGroup;
  currentUserId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', Validators.required],
      age: ['', Validators.required],
      gender: ['', Validators.required],
      occupation: [''],
      bio: [''],
      budgetMin: ['', Validators.required],
      budgetMax: ['', Validators.required],
      preferredLocations: [''], // Change to string for easier input
      interests: [''],          // Change to string for easier input
      petFriendly: [false],
      smokingOk: [false],
      petsOk: [false],
      cleanliness: [3],
      socialLevel: [3],
      noiseLevel: [3],
      profilePictures: [[]],
      isActive: [true]
    });

    // Get current user ID (assumes AuthService provides it)
    this.authService.getCurrentUser().subscribe(user => {
      this.currentUserId = user?.id || null;
    });
  }

  submit() {
    if (this.profileForm.invalid || !this.currentUserId) return;
    const formValue = this.profileForm.value;

    // Convert comma-separated strings to arrays
    formValue.preferredLocations = formValue.preferredLocations
      ? formValue.preferredLocations.split(',').map((s: string) => s.trim())
      : [];
    formValue.interests = formValue.interests
      ? formValue.interests.split(',').map((s: string) => s.trim())
      : [];

    // Map fullName to displayName for backend
    const profile: RoommateProfile = {
      ...formValue,
      displayName: formValue.fullName, // map fullName to displayName
      userId: this.currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Remove frontend-only fields before sending to backend
    const { fullName, petFriendly, ...profileToSend } = profile;

    this.matchService.createOrUpdateProfile(this.currentUserId, profileToSend).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => alert('Failed to save profile. Please try again.')
    });
  }
}