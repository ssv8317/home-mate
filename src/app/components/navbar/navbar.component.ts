import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center">
              <div class="bg-primary-500 text-white px-3 py-1 rounded-lg font-bold text-xl">
                HM
              </div>
              <span class="ml-2 text-xl font-bold text-gray-800">HomeMate</span>
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <ng-container *ngIf="!currentUser; else loggedInMenu">
              <a routerLink="/login" class="text-gray-600 hover:text-gray-800 font-medium">
                Login
              </a>
              <a routerLink="/register" class="btn-primary">
                Sign Up
              </a>
            </ng-container>
            
            <ng-template #loggedInMenu>
              <a routerLink="/dashboard" class="text-gray-600 hover:text-gray-800 font-medium">
                Dashboard
              </a>
              <div class="flex items-center space-x-3">
                <span class="text-gray-700">Hi, {{ currentUser!.fullName.split(' ')[0] }}!</span>
                <button (click)="logout()" class="text-red-600 hover:text-red-800 font-medium">
                  Logout
                </button>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}