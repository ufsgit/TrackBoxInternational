import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NavbarComponent } from './layout/navbar.component';
import { SidebarComponent } from './layout/sidebar.component';
import { AuthService } from './shared/auth.service';
import { DialogComponent } from './shared/components/dialog.component';
import { LoadingService } from './shared/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, DialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  isLoggedIn = false;
  sidebarActive = true;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    public loadingService: LoadingService
  ) {
    this.authService.currentUser.subscribe(user => {
      this.isLoggedIn = !!(user && user.token);
    });

    // Handle Route Loading UI
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => this.loadingService.hide(), 200); // Small delay for smoothness
      }
    });

    // Handle explicit loading service states
    this.loadingService.loading$.subscribe(loading => {
      this.isLoading = loading;
    });
  }

  toggleSidebar() {
    this.sidebarActive = !this.sidebarActive;
  }
}
