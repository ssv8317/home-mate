import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Join HomeMate
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Create your profile to find the perfect roommate
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div class="card">
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Basic Information -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="fullName" class="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    formControlName="fullName"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched"
                  >
                  <div *ngIf="registerForm.get('fullName')?.invalid && registerForm.get('fullName')?.touched" class="form-error">
                    Full name is required
                  </div>
                </div>

                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    formControlName="email"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
                  >
                  <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="form-error">
                    <span *ngIf="registerForm.get('email')?.errors?.['required']">Email is required</span>
                    <span *ngIf="registerForm.get('email')?.errors?.['email']">Please enter a valid email</span>
                  </div>
                </div>

                <div>
                  <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    formControlName="password"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                  >
                  <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="form-error">
                    Password must be at least 6 characters
                  </div>
                </div>

                <div>
                  <label for="age" class="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    id="age"
                    formControlName="age"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('age')?.invalid && registerForm.get('age')?.touched"
                  >
                  <div *ngIf="registerForm.get('age')?.invalid && registerForm.get('age')?.touched" class="form-error">
                    <span *ngIf="registerForm.get('age')?.errors?.['required']">Age is required</span>
                    <span *ngIf="registerForm.get('age')?.errors?.['min']">Age must be at least 18</span>
                  </div>
                </div>

                <div>
                  <label for="zipCode" class="block text-sm font-medium text-gray-700">Zip Code</label>
                  <input
                    type="text"
                    id="zipCode"
                    formControlName="zipCode"
                    class="form-input"
                    maxlength="10"
                    [class.border-red-500]="registerForm.get('zipCode')?.invalid && registerForm.get('zipCode')?.touched"
                  >
                  <div *ngIf="registerForm.get('zipCode')?.invalid && registerForm.get('zipCode')?.touched" class="form-error">
                    Zip code is required
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Details -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Details</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="gender" class="block text-sm font-medium text-gray-700">Gender</label>
                  <select id="gender" formControlName="gender" class="form-select">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div *ngIf="registerForm.get('gender')?.invalid && registerForm.get('gender')?.touched" class="form-error">
                    Gender is required
                  </div>
                </div>

                <div>
                  <label for="occupation" class="block text-sm font-medium text-gray-700">Occupation</label>
                  <input
                    type="text"
                    id="occupation"
                    formControlName="occupation"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('occupation')?.invalid && registerForm.get('occupation')?.touched"
                  >
                  <div *ngIf="registerForm.get('occupation')?.invalid && registerForm.get('occupation')?.touched" class="form-error">
                    Occupation is required
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label for="college" class="block text-sm font-medium text-gray-700">College/University (Optional)</label>
                  <input
                    type="text"
                    id="college"
                    formControlName="college"
                    class="form-input"
                  >
                </div>
              </div>
            </div>

            <!-- Lifestyle Preferences -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Lifestyle Preferences</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="sleepSchedule" class="block text-sm font-medium text-gray-700">Sleep Schedule</label>
                  <select id="sleepSchedule" formControlName="sleepSchedule" class="form-select">
                    <option value="">Select Schedule</option>
                    <option value="Early Bird">Early Bird</option>
                    <option value="Night Owl">Night Owl</option>
                  </select>
                  <div *ngIf="registerForm.get('sleepSchedule')?.invalid && registerForm.get('sleepSchedule')?.touched" class="form-error">
                    Sleep schedule is required
                  </div>
                </div>

                <div>
                  <label for="cleanlinessLevel" class="block text-sm font-medium text-gray-700">Cleanliness Level</label>
                  <select id="cleanlinessLevel" formControlName="cleanlinessLevel" class="form-select">
                    <option value="">Select Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                  <div *ngIf="registerForm.get('cleanlinessLevel')?.invalid && registerForm.get('cleanlinessLevel')?.touched" class="form-error">
                    Cleanliness level is required
                  </div>
                </div>

                <div>
                  <label for="smokingPreference" class="block text-sm font-medium text-gray-700">Smoking Preference</label>
                  <select id="smokingPreference" formControlName="smokingPreference" class="form-select">
                    <option value="">Select Preference</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <div *ngIf="registerForm.get('smokingPreference')?.invalid && registerForm.get('smokingPreference')?.touched" class="form-error">
                    Smoking preference is required
                  </div>
                </div>

                <div>
                  <label for="petFriendly" class="block text-sm font-medium text-gray-700">Pet Friendly</label>
                  <select id="petFriendly" formControlName="petFriendly" class="form-select">
                    <option value="">Select Option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <div *ngIf="registerForm.get('petFriendly')?.invalid && registerForm.get('petFriendly')?.touched" class="form-error">
                    Pet preference is required
                  </div>
                </div>
              </div>
            </div>

            <!-- Location & Budget -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Location & Budget</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="budgetRange" class="block text-sm font-medium text-gray-700">Budget Range</label>
                  <input
                    type="text"
                    id="budgetRange"
                    formControlName="budgetRange"
                    placeholder="e.g., $800-1200/month"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('budgetRange')?.invalid && registerForm.get('budgetRange')?.touched"
                  >
                  <div *ngIf="registerForm.get('budgetRange')?.invalid && registerForm.get('budgetRange')?.touched" class="form-error">
                    Budget range is required
                  </div>
                </div>

                <div>
                  <label for="locationPreference" class="block text-sm font-medium text-gray-700">Location Preference</label>
                  <input
                    type="text"
                    id="locationPreference"
                    formControlName="locationPreference"
                    placeholder="e.g., Downtown, Near Campus"
                    class="form-input"
                    [class.border-red-500]="registerForm.get('locationPreference')?.invalid && registerForm.get('locationPreference')?.touched"
                  >
                  <div *ngIf="registerForm.get('locationPreference')?.invalid && registerForm.get('locationPreference')?.touched" class="form-error">
                    Location preference is required
                  </div>
                </div>
              </div>
            </div>

            <!-- About Me -->
            <div>
              <label for="aboutMe" class="block text-sm font-medium text-gray-700">About Me</label>
              <textarea
                id="aboutMe"
                formControlName="aboutMe"
                rows="4"
                placeholder="Tell us about yourself, your hobbies, and what kind of living situation you're looking for..."
                class="form-textarea"
                [class.border-red-500]="registerForm.get('aboutMe')?.invalid && registerForm.get('aboutMe')?.touched"
              ></textarea>
              <div *ngIf="registerForm.get('aboutMe')?.invalid && registerForm.get('aboutMe')?.touched" class="form-error">
                Please tell us about yourself
              </div>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-green-600">{{ successMessage }}</p>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-600">{{ errorMessage }}</p>
            </div>

            <!-- Submit Button -->
            <div>
              <button
                type="submit"
                [disabled]="registerForm.invalid || isLoading"
                class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="isLoading">Creating Account...</span>
                <span *ngIf="!isLoading">Create Account</span>
              </button>
            </div>

            <!-- Login Link -->
            <div class="text-center">
              <p class="text-sm text-gray-600">
                Already have an account?
                <a routerLink="/login" class="text-primary-500 hover:text-primary-600 font-medium">
                  Sign in here
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      age: ['', [Validators.required, Validators.min(18)]],
      zipCode: ['', Validators.required], // Added zipCode with required validator
      gender: ['', Validators.required],
      occupation: ['', Validators.required],
      college: [''],
      sleepSchedule: ['', Validators.required],
      cleanlinessLevel: ['', Validators.required],
      smokingPreference: ['', Validators.required],
      petFriendly: ['', Validators.required],
      budgetRange: ['', Validators.required],
      locationPreference: ['', Validators.required],
      aboutMe: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.registerForm.value;

      this.authService.register(formValue).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = 'Registration successful! Redirecting to login...';
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}