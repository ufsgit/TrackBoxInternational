import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentService } from '../shared/student.service';
import { SettingsService } from '../shared/settings.service';
import { UserService } from '../shared/user.service';
import { LoadingService } from '../shared/loading.service';

@Component({
    selector: 'app-enquiry-report',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './enquiry-report.component.html',
    styleUrls: ['./enquiry-report.component.css']
})
export class EnquiryReportComponent implements OnInit {
    // Data
    reportData: any[] = [];
    branches: any[] = [];
    users: any[] = [];

    // Filters
    filters = {
        fromDate: '',
        toDate: '',
        search: '',
        branchId: null,
        staffId: null
    };

    constructor(
        private studentService: StudentService,
        private settingsService: SettingsService,
        private userService: UserService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.setDefaultDates();
        this.loadLookups();
        this.runReport();
    }

    setDefaultDates() {
        const today = new Date().toISOString().split('T')[0];
        this.filters.fromDate = today;
        this.filters.toDate = today;
    }

    loadLookups() {
        this.loadingService.show();
        this.settingsService.getBranches().subscribe({
            next: (data) => { this.branches = data; this.loadingService.hide(); },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.userService.getUsers().subscribe({
            next: (data) => { this.users = data; this.loadingService.hide(); },
            error: () => this.loadingService.hide()
        });
    }

    runReport() {
        this.loadingService.show();
        this.studentService.getEnquiryReport(this.filters).subscribe({
            next: (data) => {
                this.reportData = data;
                this.loadingService.hide();
            },
            error: (err) => {
                console.error('Report Error:', err);
                this.loadingService.hide();
            }
        });
    }

    onExport() {
        // Basic CSV export logic can be added here later or now
        // For now just console log
        console.log('Exporting data...');
        // Implementation for CSV export if requested
    }
}
