import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
    username = '';
    password = '';
    rememberMe = false;
    error = '';

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        if (this.authService.currentUserValue && this.authService.currentUserValue.token) {
            this.router.navigate(['/students']);
        }
    }

    onSubmit() {
        this.authService.login(this.username, this.password)
            .subscribe({
                next: (response) => {
                    this.router.navigate(['/students']);
                },
                error: () => this.error = 'Invalid credentials'
            });
    }
}
