import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/user.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-user-details',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './user-details.component.html',
    styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
    // User Information
    user = {
        id: 0,
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        mobile: '',
        userType: 'Staff',
        status: 'Working',
        branchId: null as number | null,
        userRole: '',
        departmentId: null as number | null,
        backupUser: '',
        extension: '',
        allTimeView: false
    };

    // Permissions Data
    branches: any[] = [];
    departments: any[] = [];

    pages = [
        { name: 'Document' },
        { name: 'Student' },
        { name: 'Document View' },
        { name: 'Qualification Tab' },
        { name: 'Language Tab' },
        { name: 'Applications Tab' }
    ];

    branchPermissions: any[] = [];
    pagePermissions: any[] = [];

    constructor(
        private userService: UserService,
        private dialogService: DialogService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const userId = params['id'];
            this.loadInitialData(userId);
        });
    }

    loadInitialData(userId?: number) {
        this.userService.getBranches().subscribe(data => {
            this.branches = data;
            this.userService.getDepartments().subscribe(deptData => {
                this.departments = deptData;
                this.initializePermissions();

                if (userId) {
                    this.loadUser(userId);
                }
            });
        });
    }

    loadUser(id: number) {
        this.userService.getUser(id).subscribe({
            next: (res) => {
                const u = res.user;
                this.user = {
                    id: u.user_id,
                    username: u.username,
                    password: '', // Clear password field for security
                    confirmPassword: '',
                    email: u.email,
                    mobile: u.mobile,
                    userType: u.user_type,
                    status: u.status,
                    branchId: u.branch_id,
                    userRole: u.user_role,
                    departmentId: u.department_id,
                    backupUser: u.backup_user,
                    extension: u.extension,
                    allTimeView: !!u.all_time_view
                };

                // Map Branch Permissions
                res.branchPermissions.forEach((bp: any) => {
                    const match = this.branchPermissions.find(p => p.branchId === bp.branch_id && p.deptId === bp.department_id);
                    if (match) {
                        match.view = !!bp.can_view;
                        match.viewAll = !!bp.can_view_all;
                        match.transfer = !!bp.can_transfer;
                    }
                });

                // Map Page Permissions
                res.pagePermissions.forEach((pp: any) => {
                    const match = this.pagePermissions.find(p => p.menuName === pp.menu_name);
                    if (match) {
                        match.view = !!pp.can_view;
                        match.save = !!pp.can_save;
                        match.edit = !!pp.can_edit;
                        match.delete = !!pp.can_delete;
                    }
                });
            },
            error: (err: any) => console.error('Error loading user:', err)
        });
    }

    initializePermissions() {
        this.branchPermissions = [];
        this.pagePermissions = [];

        // Branch permissions grid
        this.branches.forEach(b => {
            this.departments.forEach(d => {
                this.branchPermissions.push({
                    branchId: b.branch_id,
                    branchName: b.branch_name,
                    deptId: d.department_id,
                    deptName: d.department_name,
                    view: false,
                    viewAll: false,
                    transfer: false
                });
            });
        });

        // Page permissions grid
        this.pages.forEach(p => {
            this.pagePermissions.push({
                menuName: p.name,
                view: false,
                save: false,
                edit: false,
                delete: false
            });
        });
    }

    onSave() {
        if (!this.user.username) {
            this.dialogService.warn('Username is required');
            return;
        }

        if (this.user.password && this.user.password !== this.user.confirmPassword) {
            this.dialogService.warn('Passwords do not match!');
            return;
        }

        const payload = {
            user: this.user,
            branchPermissions: this.branchPermissions.filter(p => p.view || p.viewAll || p.transfer),
            pagePermissions: this.pagePermissions.filter(p => p.view || p.save || p.edit || p.delete)
        };

        this.userService.saveUser(payload).subscribe({
            next: (res) => {
                this.dialogService.success('User and permissions saved successfully!', 'Success', () => {
                    this.router.navigate(['/users']);
                });
            },
            error: (err: any) => {
                console.error('Error saving user:', err);
                this.dialogService.error('Failed to save user: ' + (err.error?.error || err.message));
            }
        });
    }

    onDuplicate() {
        this.user.id = 0;
        this.user.username = '';
        this.user.password = '';
        this.dialogService.info('User details duplicated! Please enter a NEW Username and Password to save as a new user.', 'Duplicated');
    }

    onClose() {
        this.router.navigate(['/users']);
    }
}
