import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, RouterOutlet, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { routes } from './app/app.routes';
import { NavbarComponent } from './app/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Only show navbar on non-dashboard pages -->
      <app-navbar *ngIf="!isDashboardPage"></app-navbar>
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {
  name = 'HomeMate';
  isDashboardPage = false;

  constructor(private router: Router) {
    // Listen to route changes to determine if we're on dashboard
    this.router.events.subscribe(() => {
      this.isDashboardPage = this.router.url === '/dashboard';
    });
  }
}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      ReactiveFormsModule,  // For [formGroup]
      FormsModule,         // For [(ngModel)]
      CommonModule         // For date pipe
    )
  ]
}).catch(err => console.error(err));