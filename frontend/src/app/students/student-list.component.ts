import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../shared/student.service';
import { UserService } from '../shared/user.service';
import { DialogService } from '../shared/dialog.service';
import { LoadingService } from '../shared/loading.service';


@Component({
    selector: 'app-student-list',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './student-list.component.html',
    styleUrls: ['./student-list.component.css']
})
export class StudentListComponent implements OnInit {
    students: any[] = [];
    searchQuery: string = '';

    // Filters
    filters = {
        deptId: 0,
        assignedTo: 0,
        fromDate: '',
        toDate: '',
        status: '',
        useDate: false,
        search: ''
    };

    departments: any[] = [];
    users: any[] = [];

    // Pagination
    currentPage: number = 1;
    totalItems: number = 0;
    pageSize: number = 20;

    // Advanced search toggle
    showAdvancedSearch: boolean = false;

    // History Modal
    showHistory: boolean = false;
    currentStudentName: string = '';
    selectedStudentHistory: any[] = [];

    constructor(
        private studentService: StudentService,
        private userService: UserService,
        private dialogService: DialogService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.loadInitialData();
        this.loadStudents();
    }

    loadInitialData() {
        this.userService.getDepartments().subscribe(data => this.departments = data);
        this.userService.getStaffList().subscribe(data => this.users = data);
    }

    loadStudents() {
        this.loadingService.show();
        const queryParams = {
            ...this.filters,
            search: this.searchQuery || '',
            page: this.currentPage,
            limit: this.pageSize
        };

        this.studentService.getStudents(queryParams).subscribe({
            next: (res: any) => {
                this.students = res.students || [];
                this.totalItems = res.total || 0;
                this.loadingService.hide();
            },
            error: (err: any) => {
                console.error('Error loading students:', err);
                this.loadingService.hide();
            }
        });
    }

    applyFilters() {
        this.currentPage = 1;
        this.loadStudents();
    }

    onSearch() {
        this.currentPage = 1;
        this.loadStudents();
    }

    nextPage() {
        if (this.currentPage * this.pageSize < this.totalItems) {
            this.currentPage++;
            this.loadStudents();
        }
    }

    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadStudents();
        }
    }

    toggleAdvancedSearch() {
        this.showAdvancedSearch = !this.showAdvancedSearch;
    }

    viewHistory(studentId: number, name: string) {
        this.currentStudentName = name;
        this.loadingService.show();
        this.studentService.getStudentById(studentId).subscribe({
            next: (res) => {
                this.selectedStudentHistory = res.followups || [];
                this.showHistory = true;
                this.loadingService.hide();
            },
            error: (err) => {
                this.dialogService.error('Error loading history: ' + err.message);
                this.loadingService.hide();
            }
        });
    }

    closeHistory() {
        this.showHistory = false;
        this.selectedStudentHistory = [];
    }
}
