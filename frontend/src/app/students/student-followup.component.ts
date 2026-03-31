import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../shared/student.service';
import { UserService } from '../shared/user.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-student-followup',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './student-followup.component.html',
    styleUrls: ['./student-followup.component.css']
})
export class StudentFollowupComponent implements OnInit {
    studentId: number = 0;
    studentName: string = '';

    newFollowup = {
        branch_id: null as number | null,
        department_id: null as number | null,
        status: 'Interested',
        assigned_to: null as number | null,
        follow_up_date: '',
        remark: ''
    };

    followupHistory: any[] = [];
    branches: any[] = [];
    departments: any[] = [];
    users: any[] = [];

    constructor(
        private studentService: StudentService,
        private userService: UserService,
        private dialogService: DialogService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.studentId = +params['id'];
            this.loadInitialData();
            this.loadHistory();
        });
    }

    loadInitialData() {
        this.userService.getBranches().subscribe((data: any[]) => this.branches = data);
        this.userService.getDepartments().subscribe((data: any[]) => this.departments = data);
        this.userService.getUsers().subscribe((data: any[]) => this.users = data);
    }

    loadHistory() {
        this.studentService.getStudentById(this.studentId).subscribe((res: any) => {
            this.studentName = res.student.student_name;
            this.followupHistory = res.followups || [];

            // Pre-fill from student current branch/dept if available
            this.newFollowup.branch_id = res.student.branch_id;
            this.newFollowup.assigned_to = res.student.assigned_to;
        });
    }

    onAddFollowup() {
        if (!this.newFollowup.follow_up_date || !this.newFollowup.remark) {
            this.dialogService.warn('Follow-up Date and Remark are required!');
            return;
        }

        const payload = {
            ...this.newFollowup,
            student_id: this.studentId
        };

        this.studentService.addFollowup(payload).subscribe({
            next: () => {
                this.dialogService.success('Follow-up recorded successfully!', 'Recorded', () => {
                    this.loadHistory();
                    this.newFollowup.remark = '';
                });
            },
            error: (err: any) => this.dialogService.error('Error: ' + (err.error?.error || err.message))
        });
    }

    onBack() {
        this.router.navigate(['/students']);
    }
}
