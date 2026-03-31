import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { API_CONFIG } from '../shared/constants';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
    @Input() isActive: boolean = true;
    notificationUrl = API_CONFIG.NOTIFICATION_URL;
    isSettingsExpanded = false;
    isReportsExpanded = false;

    constructor(private router: Router) { }

    ngOnInit() {
        // Expand settings if we are currently on a settings route
        if (this.router.url.includes('/settings/')) {
            this.isSettingsExpanded = true;
        }
        if (this.router.url.includes('/reports/')) {
            this.isReportsExpanded = true;
        }
    }

    toggleSettings() {
        this.isSettingsExpanded = !this.isSettingsExpanded;
    }

    toggleReports() {
        this.isReportsExpanded = !this.isReportsExpanded;
    }
}

