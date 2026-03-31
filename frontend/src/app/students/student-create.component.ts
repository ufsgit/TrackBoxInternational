import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../shared/student.service';
import { DialogService } from '../shared/dialog.service';
import { UserService } from '../shared/user.service';
import { SettingsService } from '../shared/settings.service';
import { LoadingService } from '../shared/loading.service';

import { SearchableDropdownComponent } from '../shared/components/searchable-dropdown.component';

@Component({
    selector: 'app-student-details',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, SearchableDropdownComponent],
    templateUrl: './student-create.component.html',
    styleUrls: ['./student-create.component.css']
})
export class StudentCreateComponent implements OnInit {
    student = {
        id: 0,
        student_name: '',
        mobile_country_code: '+91',
        mobile_number: '',
        phone_country_code: '+91',
        phone_number: '',
        email: '',
        whatsapp: false,
        botim: false,
        telegram: false,
        phone_whatsapp: false,
        phone_botim: false,
        phone_telegram: false,
        enquiry_source: '',
        study_interested: false,
        migration_interested: false,
        coaching_interested: false,
        visa_interested: false,
        work_interested: false,
        branch_id: null as number | null,
        assigned_to: null as number | null,
        current_status: 'New Lead'
    };

    // Dynamic Program Entries
    programs = {
        study: [] as any[],
        migration: [] as any[],
        coaching: [] as any[],
        visa: [] as any[],
        work: [] as any[]
    };

    // Follow-up Entry
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
    departments: any[] = []; // All departments
    filteredDepartments: any[] = [];
    filteredStatuses: any[] = [];
    users: any[] = [];

    // Master Data Lookups
    lookups = {
        countries: [] as any[],
        levels: [] as any[],
        intakes: [] as any[],
        occupations: [] as any[],
        years: [] as any[],
        fields: [] as any[],
        categories: [] as any[]
    };

    formattedLookups = {
        countries: [] as any[],
        levels: [] as any[],
        intakes: [] as any[],
        occupations: [] as any[],
        years: [] as any[],
        fields: [] as any[],
        categories: [] as any[]
    };

    constructor(
        private studentService: StudentService,
        private userService: UserService,
        private settingsService: SettingsService,
        private dialogService: DialogService,
        private loadingService: LoadingService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    formatLookup(items: any[]): { label: string, value: string }[] {
        return items.map(i => ({ label: i.name, value: i.name }));
    }

    ngOnInit() {
        this.loadInitialData();
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.loadStudent(params['id']);
            }
        });
    }

    loadInitialData() {
        this.loadingService.show();
        this.userService.getBranches().subscribe({
            next: (data) => {
                this.branches = data;
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.userService.getDepartments().subscribe({
            next: (data) => {
                this.departments = data;
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.studentService.getLookups().subscribe({
            next: (data) => {
                this.lookups = data;
                this.refreshFormattedLookups();
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });
    }

    refreshFormattedLookups() {
        this.formattedLookups.countries = this.formatLookup(this.lookups.countries);
        this.formattedLookups.levels = this.formatLookup(this.lookups.levels);
        this.formattedLookups.intakes = this.formatLookup(this.lookups.intakes);
        this.formattedLookups.occupations = this.formatLookup(this.lookups.occupations);
        this.formattedLookups.years = this.formatLookup(this.lookups.years);
        this.formattedLookups.fields = this.formatLookup(this.lookups.fields);
        this.formattedLookups.categories = this.formatLookup(this.lookups.categories);
    }

    // Dependent Dropdowns
    onBranchChange() {
        this.newFollowup.department_id = null;
        this.newFollowup.status = '';
        this.filteredDepartments = [];
        this.filteredStatuses = [];

        if (this.newFollowup.branch_id) {
            this.loadingService.show();
            this.settingsService.getBranchDepartments(this.newFollowup.branch_id).subscribe({
                next: (data) => {
                    this.filteredDepartments = data;
                    this.loadingService.hide();
                },
                error: () => this.loadingService.hide()
            });
        }
    }

    onDepartmentChange() {
        this.newFollowup.status = '';
        this.filteredStatuses = [];

        if (this.newFollowup.department_id) {
            this.loadingService.show();
            this.settingsService.getDepartmentStatuses(this.newFollowup.department_id).subscribe({
                next: (data) => {
                    this.filteredStatuses = data;
                    if (this.filteredStatuses.length > 0) {
                        this.newFollowup.status = this.filteredStatuses[0].status_name;
                    }
                    this.loadingService.hide();
                },
                error: () => this.loadingService.hide()
            });
        }
    }

    loadStudent(id: number) {
        this.loadingService.show();
        this.studentService.getStudentById(id).subscribe({
            next: (res) => {
                this.student = { ...res.student, id: id };
                this.programs = {
                    study: res.study || [],
                    migration: res.migration || [],
                    coaching: res.coaching || [],
                    visa: res.visa || [],
                    work: res.work || []
                };
                this.followupHistory = res.followups || [];
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });
    }

    onProgramToggle(type: keyof typeof this.programs, isChecked: boolean) {
        if (isChecked && this.programs[type].length === 0) {
            this.addProgramRow(type);
        }
    }

    // Dynamic row management
    addProgramRow(type: keyof typeof this.programs) {
        const templates = {
            study: { country: '', level: '', field: '', intake: '', year: '' },
            migration: { country: '', occupation: '', category: '' },
            coaching: { course: '', batch: '' },
            visa: { country: '', category: '' },
            work: { country: '', occupation: '' }
        };
        this.programs[type].push({ ...templates[type] });
    }

    removeProgramRow(type: keyof typeof this.programs, index: number) {
        this.programs[type].splice(index, 1);
        // If all rows removed, uncheck the interest
        if (this.programs[type].length === 0) {
            if (type === 'study') this.student.study_interested = false;
            if (type === 'migration') this.student.migration_interested = false;
            if (type === 'coaching') this.student.coaching_interested = false;
            if (type === 'visa') this.student.visa_interested = false;
            if (type === 'work') this.student.work_interested = false;
        }
    }

    onSave() {
        if (!this.student.student_name || !this.student.mobile_number) {
            this.dialogService.warn('Student Name and Mobile Number are required!');
            return;
        }

        const payload = {
            student: this.student,
            programs: this.programs
        };

        this.loadingService.show();
        this.studentService.saveStudent(payload).subscribe({
            next: (res) => {
                const newId = res.id;
                const isNew = !this.student.id;

                const hasFollowupData = this.newFollowup.status || this.newFollowup.remark || this.newFollowup.follow_up_date;

                if (isNew && newId && hasFollowupData) {
                    const todayStr = new Date().toISOString().split('T')[0];

                    const fuPayload = {
                        ...this.newFollowup,
                        student_id: newId,
                        branch_id: this.newFollowup.branch_id || this.student.branch_id,
                        department_id: this.newFollowup.department_id || (this.departments.length > 0 ? this.departments[0].department_id : null),
                        follow_up_date: this.newFollowup.follow_up_date || todayStr,
                        remark: this.newFollowup.remark || `Initial Status: ${this.newFollowup.status || 'New Lead'}`
                    };

                    if (!fuPayload.branch_id || !fuPayload.department_id) {
                        this.loadingService.hide();
                        this.dialogService.warn('Student saved, but follow-up requires Branch and Department. Please add follow-up manually.');
                        this.router.navigate(['/students/edit', newId]);
                        return;
                    }

                    this.studentService.addFollowup(fuPayload).subscribe({
                        next: () => {
                            this.loadingService.hide();
                            this.dialogService.success('Student profile and initial follow-up saved!', 'Saved', () => {
                                this.router.navigate(['/students/edit', newId]);
                            });
                        },
                        error: (err) => {
                            this.loadingService.hide();
                            console.error('Follow-up error:', err);
                            this.dialogService.error('Student saved, but follow-up failed. You can add it now.');
                            this.router.navigate(['/students/edit', newId]);
                        }
                    });
                } else {
                    this.loadingService.hide();
                    const successMsg = isNew ? 'Student profile created successfully!' : 'Student profile updated successfully!';
                    this.dialogService.success(successMsg, 'Saved', () => {
                        if (isNew && newId) {
                            this.router.navigate(['/students/edit', newId]);
                        } else if (this.student.id) {
                            this.loadStudent(this.student.id);
                        }
                    });
                }
            },
            error: (err) => {
                this.loadingService.hide();
                this.dialogService.error('Error saving student: ' + (err.error?.error || err.message));
            }
        });
    }

    onDelete() {
        if (!this.student.id) {
            this.dialogService.warn('Cannot delete a student that hasn\'t been saved yet.');
            return;
        }

        this.dialogService.confirm(
            `Are you sure you want to delete "${this.student.student_name}"? This action cannot be undone and will also delete all associated follow-up records.`,
            'Delete Student'
        ).subscribe(confirmed => {
            if (confirmed) {
                this.loadingService.show();
                this.studentService.deleteStudent(this.student.id!).subscribe({
                    next: () => {
                        this.loadingService.hide();
                        this.dialogService.success('Student deleted successfully!', 'Deleted', () => {
                            this.router.navigate(['/students']);
                        });
                    },
                    error: (err) => {
                        this.loadingService.hide();
                        this.dialogService.error('Error deleting student: ' + (err.error?.error || err.message));
                    }
                });
            }
        });
    }

    onAddFollowup() {
        if (!this.newFollowup.follow_up_date || !this.newFollowup.remark) {
            this.dialogService.warn('Follow-up Date and Remark are required!');
            return;
        }

        const payload = {
            ...this.newFollowup,
            student_id: this.student.id
        };

        this.loadingService.show();
        this.studentService.addFollowup(payload).subscribe({
            next: () => {
                this.loadingService.hide();
                this.dialogService.success('Follow-up added successfully!', 'Success', () => {
                    this.loadStudent(this.student.id); // Reload history
                    this.newFollowup.remark = ''; // Clear remark
                });
            },
            error: (err) => {
                this.loadingService.hide();
                this.dialogService.error('Error adding follow-up: ' + (err.error?.error || err.message));
            }
        });
    }

    onApplicationForm() {
        this.router.navigate(['/students/application', this.student.id]);
    }

    onClose() {
        this.router.navigate(['/students']);
    }
}
