import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../shared/auth.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
    @Output() toggleSidebar = new EventEmitter<void>();
    currentUser: any;

    constructor(private authService: AuthService) {
        this.authService.currentUser.subscribe(user => this.currentUser = user);
    }

    toggle() {
        this.toggleSidebar.emit();
    }

    logout() {
        this.authService.logout();
    }
}
