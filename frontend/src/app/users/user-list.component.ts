import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../shared/user.service';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    users: any[] = [];
    loading = true;

    constructor(
        private userService: UserService,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (data: any) => {
                this.users = data;
                this.loading = false;
            },
            error: (err: any) => {
                console.error('Error loading users:', err);
                this.loading = false;
            }
        });
    }

    onCreateUser() {
        this.router.navigate(['/users/details']);
    }

    editUser(user: any) {
        // Logic to navigate to details with user ID
        this.router.navigate(['/users/details'], { queryParams: { id: user.user_id } });
    }
}
