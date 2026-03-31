import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentService } from '../shared/student.service';
import { RouterModule } from '@angular/router';
import { LoadingService } from '../shared/loading.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    stats: any = {
        summary: { todayFollowups: 0, pendingFollowups: 0, totalStudents: 0 },
        statusDistribution: [],
        chartData: []
    };

    filterType: string = 'thisMonth';
    startDate: string = '';
    endDate: string = '';

    constructor(
        private studentService: StudentService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.setFilter('thisMonth');
    }

    setFilter(type: string) {
        this.filterType = type;
        const now = new Date();
        let start = new Date();
        let end = new Date();

        // Ensure we work with local dates
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        switch (type) {
            case 'today':
                // Already set to today 00:00 - 23:59
                break;
            case 'thisWeek':
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                start.setDate(diff);
                break;
            case 'thisMonth':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'last6Months':
                start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                break;
        }

        // Format to YYYY-MM-DD for API
        const formatDate = (date: Date) => {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        };

        this.startDate = formatDate(start);
        this.endDate = formatDate(end);
        this.loadStats();
    }

    loadStats() {
        this.loadingService.show();
        const filter = (this.filterType === 'today' || this.filterType === 'thisWeek') ? 'day' : 'month';
        this.studentService.getDashboardStats(filter, this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.stats = data;
                this.calculateMaxCount();
                this.loadingService.hide();
            },
            error: (err) => {
                console.error('Dashboard Error:', err);
                this.loadingService.hide();
            }
        });
    }

    // Helper for simple bar chart scaling
    maxCount = 10;
    calculateMaxCount() {
        if (this.stats && this.stats.chartData && this.stats.chartData.length > 0) {
            this.maxCount = Math.max(...this.stats.chartData.map((d: any) => d.count), 10);
        }
    }

    getBarHeight(count: number): string {
        const percentage = (count / this.maxCount) * 100;
        return `${Math.max(percentage, 5)}%`; // Min 5% height for visibility
    }
}
