import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { StudentListComponent } from './students/student-list.component';
import { StudentCreateComponent } from './students/student-create.component';
import { StudentFollowupComponent } from './students/student-followup.component';
import { UserListComponent } from './users/user-list.component';
import { UserDetailsComponent } from './users/user-details.component';
import { BranchListComponent } from './settings/branch-list.component';
import { DepartmentListComponent } from './settings/department-list.component';
import { EnquirySourceListComponent } from './settings/enquiry-source-list.component';
import { StatusListComponent } from './settings/status-list.component';
import { LevelListComponent } from './settings/level-list.component';
import { FieldListComponent } from './settings/field-list.component';
import { ApplicationStatusListComponent } from './settings/application-status-list.component';
import { ApplicationSubStatusListComponent } from './settings/application-sub-status-list.component';
import { EnquiryReportComponent } from './reports/enquiry-report.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './shared/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'students', component: StudentListComponent },
            { path: 'students/create', component: StudentCreateComponent },
            { path: 'students/edit/:id', component: StudentCreateComponent },
            { path: 'students/followup/:id', component: StudentFollowupComponent },
            { path: 'students/application/:id', loadComponent: () => import('./students/student-application.component').then(m => m.StudentApplicationComponent) },
            { path: 'students/registration/:id', loadComponent: () => import('./students/student-registration.component').then(m => m.StudentRegistrationComponent) },
            { path: 'users', component: UserListComponent },
            { path: 'users/details', component: UserDetailsComponent },
            { path: 'settings/branches', component: BranchListComponent },
            { path: 'settings/departments', component: DepartmentListComponent },
            { path: 'settings/sources', component: EnquirySourceListComponent },
            { path: 'settings/statuses', component: StatusListComponent },
            { path: 'settings/levels', component: LevelListComponent },
            { path: 'settings/fields', component: FieldListComponent },
            { path: 'settings/app-status', component: ApplicationStatusListComponent },
            { path: 'settings/app-sub-status', component: ApplicationSubStatusListComponent },
            { path: 'reports/enquiry', component: EnquiryReportComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
// reload trigger
