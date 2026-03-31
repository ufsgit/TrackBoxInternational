import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../shared/student.service';
import { UserService } from '../shared/user.service';
import { DialogService } from '../shared/dialog.service';
import { SettingsService } from '../shared/settings.service';
import { LoadingService } from '../shared/loading.service';


@Component({
    selector: 'app-student-registration',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './student-registration.component.html',
    styleUrls: ['./student-registration.component.css']
})
export class StudentRegistrationComponent implements OnInit {
    studentId: number = 0;
    student: any = {};
    studentPrograms: any = {};
    application: any = {
        passport_name: '',
        contact1: '',
        contact2: '',
        email: '',
        gender: 'Male',
        marital_status: 'Single',
        spouse_accompanying: false,
        spouse_age: null,
        spouse_edu_level: '',
        spouse_edu_field: '',
        spouse_has_work_experience: false,
        spouse_work_experience_list: [],
        spouse_has_other_work_experience: false,
        spouse_other_work_experience_list: [],
        has_canadian_edu: false,
        has_australian_edu: false,
        has_aus_specialised_edu: false,
        has_nz_edu: false,
        has_work_experience: false,
        work_experience: '',
        work_experience_list: [],
        has_other_work_experience: false,
        other_work_experience_list: [],
        has_language_test: false,
        has_admission_test: false,
        has_relatives: false,
        spouse_canadian_edu: false,
        spouse_australian_edu: false,
        spouse_aus_specialised_edu: false,
        migration_data: {},
        migration_spouse_data: {},
        relatives_data: {},
        passport_country: '',
        has_second_passport: false,
        second_passport_country: ''
    };
    children: any[] = [];
    suggestedPrograms: any[] = [];

    rowDepartments: { [key: number]: any[] } = {};
    rowStaff: { [key: number]: any[] } = {};

    branches: any[] = [];
    allDepartments: any[] = [];
    allStaff: any[] = [];

    allAppStatuses: any[] = [];
    appSubStatuses: { [key: number]: any[] } = {};

    lookups: any = {
        countries: [],
        levels: [],
        fields: [],
        categories: []
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private studentService: StudentService,
        private userService: UserService,
        private dialogService: DialogService,
        private settingsService: SettingsService,
        private loadingService: LoadingService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.studentId = +params['id'];
            if (this.studentId) {
                this.loadInitialData();
                this.loadApplication();
                this.loadApplicationStatuses();
            }
        });
    }

    loadApplicationStatuses() {
        this.loadingService.show();
        this.settingsService.getApplicationStatuses().subscribe({
            next: (data) => {
                this.allAppStatuses = data;
                this.resolveStatusIds();
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.settingsService.getApplicationSubStatuses().subscribe({
            next: (data) => {
                const grouped: any = {};
                data.forEach(ss => {
                    if (!grouped[ss.status_id]) grouped[ss.status_id] = [];
                    grouped[ss.status_id].push(ss);
                });
                this.appSubStatuses = grouped;
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });
    }

    resolveStatusIds() {
        if (!this.allAppStatuses.length || !this.suggestedPrograms.length) return;
        this.suggestedPrograms.forEach(p => {
            const selected = this.allAppStatuses.find(s => s.name === p.status && (s.categories || []).includes(p.type));
            p.status_id = selected ? selected.status_id : null;
        });
    }

    getFilteredStatuses(category: string) {
        if (!category) return [];
        // Match category with the list of categories in status
        const cat = category.toUpperCase();
        return this.allAppStatuses.filter(s => (s.categories || []).includes(cat));
    }

    onStatusChange(p: any) {
        // Find the status_id for the selected status name to filter sub-statuses
        const selected = this.allAppStatuses.find(s => s.name === p.status && (s.categories || []).includes(p.type));
        p.status_id = selected ? selected.status_id : null;
        p.sub_status = ''; // reset sub-status on main status change
    }

    loadInitialData() {
        this.loadingService.show();
        this.studentService.getLookups().subscribe({
            next: (data: any) => {
                this.lookups = data;
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.studentService.getBranches().subscribe({
            next: (data) => {
                this.branches = data;
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });

        this.loadingService.show();
        this.studentService.getStudentById(this.studentId).subscribe({
            next: (res) => {
                console.log('DEBUG: Student API Response:', res);
                this.student = res.student;

                // Map flat response keys to studentPrograms object
                this.studentPrograms = {
                    study: res.study || [],
                    migration: res.migration || [],
                    coaching: res.coaching || [],
                    visa: res.visa || [],
                    work: res.work || []
                };
                console.log('DEBUG: Mapped Programs:', this.studentPrograms);

                this.initializeMigrationData();
                this.prePopulateFields();
                if (this.suggestedPrograms.length === 0) {
                    this.syncSuggestedPrograms();
                }
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });
    }

    prePopulateFields() {
        if (!this.student || !this.application) return;
        if (!this.application.passport_name) this.application.passport_name = this.student.student_name;
        if (!this.application.contact1) this.application.contact1 = this.student.mobile_number;
        if (!this.application.contact2) this.application.contact2 = this.student.phone_number;
        if (!this.application.email) this.application.email = this.student.email;
    }

    loadApplication() {
        this.loadingService.show();
        this.studentService.getStudentRegistration(this.studentId).subscribe({
            next: (data) => {
                if (data.application) {
                    this.application = data.application;
                    // Ensure boolean types
                    ['spouse_accompanying', 'has_canadian_edu', 'has_australian_edu', 'has_aus_specialised_edu',
                        'has_nz_edu', 'has_work_experience', 'has_language_test', 'has_admission_test', 'has_relatives',
                        'spouse_canadian_edu', 'spouse_australian_edu', 'spouse_aus_specialised_edu', 'has_second_passport'].forEach(key => {
                            this.application[key] = !!this.application[key];
                        });

                    this.prePopulateFields();

                    if (this.application.dob) {
                        this.application.dob = new Date(this.application.dob).toISOString().split('T')[0];
                    }

                    // Parse JSON fields
                    if (typeof this.application.migration_data === 'string') {
                        try { this.application.migration_data = JSON.parse(this.application.migration_data); } catch (e) { this.application.migration_data = {}; }
                    }
                    if (typeof this.application.migration_spouse_data === 'string') {
                        try { this.application.migration_spouse_data = JSON.parse(this.application.migration_spouse_data); } catch (e) { this.application.migration_spouse_data = {}; }
                    }
                    if (typeof this.application.relatives_data === 'string') {
                        try { this.application.relatives_data = JSON.parse(this.application.relatives_data); } catch (e) { this.application.relatives_data = {}; }
                    }
                    if (typeof this.application.education_data === 'string') {
                        try { this.application.education_data = JSON.parse(this.application.education_data); } catch (e) { this.application.education_data = {}; }
                    }

                    this.initializeMigrationData();

                    // Backward compatibility sync: Map flat fields to JSON for UI
                    const countriesToSync = [
                        { name: 'Canada', prefix: 'canadian' },
                        { name: 'Australia', prefix: 'australian' },
                        { name: 'New Zealand', prefix: 'nz', altPrefix: 'nz' }
                    ];

                    countriesToSync.forEach(c => {
                        const prefix = c.prefix;
                        const name = c.name;

                        // Education mapping
                        if (this.application.education_data[name]) {
                            if (this.application[`has_${prefix}_edu`]) this.application.education_data[name].has_edu = !!this.application[`has_${prefix}_edu`];
                            if (this.application[`${prefix}_edu_level`]) this.application.education_data[name].level = this.application[`${prefix}_edu_level`];
                            if (this.application[`${prefix}_edu_field`]) this.application.education_data[name].field = this.application[`${prefix}_edu_field`];
                        }

                        // Migration mapping (Applicant)
                        if (this.application.migration_data[name]) {
                            if (this.application[`has_${prefix}_edu`]) this.application.migration_data[name].has_edu = !!this.application[`has_${prefix}_edu`];
                            if (this.application[`${prefix}_work_years`]) this.application.migration_data[name].work_years = this.application[`${prefix}_work_years`];
                        }

                        // Migration mapping (Spouse)
                        if (this.application.migration_spouse_data[name]) {
                            if (this.application[`spouse_${prefix}_edu`]) this.application.migration_spouse_data[name].has_edu = !!this.application[`spouse_${prefix}_edu`];
                            if (this.application[`spouse_${prefix}_work`]) this.application.migration_spouse_data[name].work_years = this.application[`spouse_${prefix}_work`];
                        }
                    });
                }
                this.children = data.children || [];
                this.suggestedPrograms = (data.suggestedPrograms || []).flatMap((p: any) => {
                    const upperProg = (p.program || '').toUpperCase();
                    let type = 'OTHER';
                    if (upperProg.includes('STUDY')) type = 'STUDY';
                    else if (upperProg.includes('MIGRATION')) type = 'MIGRATION';
                    else if (upperProg.includes('VISA')) type = 'VISA';
                    else if (upperProg.includes('WORK')) type = 'WORK';
                    else if (upperProg.includes('COACHING')) type = 'COACHING';

                    let country = '', level = '', field = '', intake = '', year = '', occupation = '', category = '', course = '', batch = '', subType = 'default';

                    if (type === 'STUDY') {
                        country = p.program.replace(/STUDY/i, '').trim();
                        const mainParts = p.details.split(' - ');
                        const courseParts = (mainParts[0] || '').split(' ');
                        const intakeParts = (mainParts[1] || '').split(' ');

                        level = courseParts[0] || '';
                        field = courseParts.slice(1).join(' ') || '';
                        intake = intakeParts[0] || '';
                        year = intakeParts[1] || '';
                        subType = 'default';
                    } else if (type === 'MIGRATION') {
                        country = p.program.replace('MIGRATION', '').trim();
                        const parts = p.details.split(' - ');
                        occupation = parts[0] || '';
                        category = parts[1] || '';
                    } else if (type === 'VISA') {
                        country = p.program.replace('VISA', '').trim();
                        category = p.details;
                    } else if (type === 'WORK') {
                        country = p.program.replace('WORK', '').trim();
                        occupation = p.details;
                    } else if (type === 'COACHING') {
                        const parts = p.details.split(' - ');
                        course = parts[0] || '';
                        batch = parts[1] || '';
                    }

                    const result = { ...p, type, subType, country, level, field, intake, year, occupation, category, course, batch };

                    // Initialize cascading data for existing programs
                    const idx = this.suggestedPrograms.length + 0; // index in the final array depends on how flatMap works, better to do after map
                    return [result];
                });

                // After loading, initialize cascading maps
                this.suggestedPrograms.forEach((p, i) => {
                    if (p.branch_id) this.loadRowDepartments(i, p.branch_id);
                    if (p.branch_id && p.department_id) this.loadRowStaff(i, p.branch_id, p.department_id);
                });

                this.resolveStatusIds();

                if (this.suggestedPrograms.length === 0) {
                    this.syncSuggestedPrograms();
                }
                this.loadingService.hide();
            },
            error: () => this.loadingService.hide()
        });
    }

    addChild() {
        this.children.push({ age: null, is_accompanying: true });
    }

    onChildrenCountChange(count: any) {
        const targetCount = Math.max(0, parseInt(count) || 0);
        while (this.children.length < targetCount) {
            this.children.push({ age: null, is_accompanying: true });
        }
        while (this.children.length > targetCount) {
            this.children.pop();
        }
    }

    removeChild(index: number) {
        this.children.splice(index, 1);
    }

    addSuggestedProgram(type: string) {
        if (type === 'STUDY') {
            const common = {
                type,
                program: type,
                details: '',
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                branch_id: null,
                department_id: null,
                assigned_to: null,
                country: '',
                level: '', field: '', intake: '', year: '', occupation: '', category: '', course: '', batch: ''
            };
            this.suggestedPrograms.push({ ...common, subType: 'default' });
        } else {
            const newProg: any = {
                type,
                subType: 'default',
                program: type === 'OTHER' ? '' : type,
                details: '',
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                branch_id: null,
                department_id: null,
                assigned_to: null,
                country: '', level: '', field: '', intake: '', year: '', occupation: '', category: '', course: '', batch: ''
            };
            this.suggestedPrograms.push(newProg);
        }
        this.initializeMigrationData();
    }

    onCountryChange(p: any) {
        this.syncSuggestedProgStrings(p);
        this.initializeMigrationData();
    }

    onBranchChange(index: number) {
        const p = this.suggestedPrograms[index];
        p.department_id = null;
        p.assigned_to = null;
        this.rowDepartments[index] = [];
        this.rowStaff[index] = [];
        if (p.branch_id) {
            this.loadRowDepartments(index, p.branch_id);
        }
    }

    onDepartmentChange(index: number) {
        const p = this.suggestedPrograms[index];
        p.assigned_to = null;
        this.rowStaff[index] = [];
        if (p.branch_id && p.department_id) {
            this.loadRowStaff(index, p.branch_id, p.department_id);
        }
    }

    loadRowDepartments(index: number, branchId: number) {
        this.studentService.getBranchDepartments(branchId).subscribe(data => {
            this.rowDepartments[index] = data;
        });
    }

    loadRowStaff(index: number, branchId: number, deptId: number) {
        this.studentService.getStaff(branchId, deptId).subscribe(data => {
            this.rowStaff[index] = data;
        });
    }

    syncSuggestedProgStrings(p: any) {
        if (p.type === 'STUDY') {
            p.program = `STUDY ${p.country || ''}`.trim();
            p.details = `${p.level || ''} ${p.field || ''} - ${p.intake || ''} ${p.year || ''}`.trim();
            if (p.details === '-') p.details = '';
        } else if (p.type === 'MIGRATION') {
            p.program = `MIGRATION ${p.country || ''}`.trim();
            p.details = `${p.occupation || ''} - ${p.category || ''}`.trim();
        } else if (p.type === 'VISA') {
            p.program = `VISA ${p.country || ''}`.trim();
            p.details = `${p.category || ''}`.trim();
        } else if (p.type === 'WORK') {
            p.program = `WORK ${p.country || ''}`.trim();
            p.details = `${p.occupation || ''}`.trim();
        } else if (p.type === 'COACHING') {
            p.program = `COACHING`.trim();
            p.details = `${p.course || ''} - ${p.batch || ''}`.trim();
        }
    }

    removeProgram(index: number) {
        this.suggestedPrograms.splice(index, 1);
        this.initializeMigrationData();
    }

    get allInterests(): any[] {
        const interests: any[] = [];
        if (!this.studentPrograms) return interests;

        (this.studentPrograms.study || []).forEach((p: any) => {
            interests.push({
                type: 'STUDY',
                country: p.country || '',
                level: p.level || '',
                field: p.field || '',
                timing: `${p.intake || ''} ${p.year || ''}`.trim()
            });
        });
        (this.studentPrograms.migration || []).forEach((p: any) => {
            interests.push({
                type: 'MIGRATION',
                country: p.country || '',
                level: p.occupation || '',
                field: p.category || '',
                timing: ''
            });
        });
        (this.studentPrograms.visa || []).forEach((p: any) => {
            interests.push({
                type: 'VISA',
                country: p.country || '',
                level: p.category || '',
                field: '',
                timing: ''
            });
        });
        (this.studentPrograms.work || []).forEach((p: any) => {
            interests.push({
                type: 'WORK',
                country: p.country || '',
                level: p.occupation || '',
                field: '',
                timing: ''
            });
        });
        (this.studentPrograms.coaching || []).forEach((p: any) => {
            interests.push({
                type: 'COACHING',
                country: '',
                level: p.course || '',
                field: p.batch || '',
                timing: ''
            });
        });

        return interests;
    }

    get showAgeField(): boolean {
        if (!this.suggestedPrograms || this.suggestedPrograms.length === 0) {
            return true;
        }
        const types = this.suggestedPrograms.map(p => p.type.toUpperCase());
        const onlyVisa = types.every(t => t === 'VISA');
        return !onlyVisa;
    }

    get showGeneralWorkExperience(): boolean {
        if (!this.suggestedPrograms || this.suggestedPrograms.length === 0) {
            return true;
        }
        return !this.suggestedPrograms.some(p => p.type.toUpperCase() === 'MIGRATION');
    }

    get interestedCountries(): string[] {
        const countries: string[] = [];
        // Drive visibility primarily from Suggested Programs table
        if (this.suggestedPrograms && this.suggestedPrograms.length > 0) {
            this.suggestedPrograms.forEach(p => {
                if (p.type === 'MIGRATION' && p.country) {
                    countries.push(p.country);
                }
            });
        } else if (this.studentPrograms) {
            // Fallback to student profile data if no suggested programs yet
            (this.studentPrograms.migration || []).forEach((p: any) => { if (p.country) countries.push(p.country) });
        }
        return [...new Set(countries)];
    }

    get educationCountries(): string[] {
        const countries: string[] = [];
        if (this.suggestedPrograms && this.suggestedPrograms.length > 0) {
            this.suggestedPrograms.forEach(p => {
                if (p.type === 'MIGRATION' && p.country) {
                    countries.push(p.country);
                }
            });
        } else if (this.studentPrograms) {
            (this.studentPrograms.migration || []).forEach((p: any) => { if (p.country) countries.push(p.country) });
        }
        return [...new Set(countries)];
    }

    initializeMigrationData() {
        if (!this.application.migration_data) this.application.migration_data = {};
        if (!this.application.migration_spouse_data) this.application.migration_spouse_data = {};
        if (!this.application.relatives_data) this.application.relatives_data = {};
        if (!this.application.education_data) this.application.education_data = {};

        if (!this.application.work_experience_list) this.application.work_experience_list = [];
        if (!this.application.spouse_work_experience_list) this.application.spouse_work_experience_list = [];
        if (!this.application.other_work_experience_list) this.application.other_work_experience_list = [];
        if (!this.application.spouse_other_work_experience_list) this.application.spouse_other_work_experience_list = [];

        if (!this.application.migration_spouse_data['General']) {
            this.application.migration_spouse_data['General'] = { has_edu: false, edu_level: '', edu_field: '', has_work: false, work_years: '', work_months: '', job_title: '', work_experience_list: [] };
        }

        this.interestedCountries.forEach(country => {
            if (!this.application.migration_data[country]) {
                this.application.migration_data[country] = { 
                    has_edu: false, edu_level: '', edu_field: '', 
                    has_work: false, 
                    is_currently_working: false, 
                    current_work_experience_list: [],
                    has_other_work: false,
                    other_work_experience_list: [],
                    work_years: '', work_months: '', job_title: '', work_experience_list: [] 
                };
            }
            if (!this.application.migration_spouse_data[country]) {
                this.application.migration_spouse_data[country] = { 
                    has_edu: false, edu_level: '', edu_field: '', 
                    has_work: false, 
                    is_currently_working: false, 
                    current_work_experience_list: [],
                    has_other_work: false,
                    other_work_experience_list: [],
                    work_years: '', work_months: '', job_title: '', work_experience_list: [] 
                };
            }
            if (!this.application.relatives_data[country]) {
                this.application.relatives_data[country] = { has_rel: false, relationship: '', related_to: 'Applicant' };
            }
        });

        this.educationCountries.forEach(country => {
            if (!this.application.education_data[country]) {
                this.application.education_data[country] = { has_edu: false, level: '', field: '' };
            }
        });
        if (!this.application.education_data.additional) {
            this.application.education_data.additional = [];
        }
    }

    addQualification() {
        if (!this.application.education_data.additional) {
            this.application.education_data.additional = [];
        }
        this.application.education_data.additional.push({ level: '', field: '' });
    }

    addSpouseQualification() {
        if (!this.application.spouse_education) {
            this.application.spouse_education = [];
        }
        this.application.spouse_education.push({ level: '', field: '' });
    }

    removeSpouseQualification(index: number) {
        if (this.application.spouse_education && this.application.spouse_education[index]) {
            this.application.spouse_education.splice(index, 1);
        }
    }

    addWorkExperience(country: string | null, target: string, subTarget: string = 'work_experience_list') {
        const newItem = { job_title: '', work_years: '', work_months: '', employment_country: '' };
        if (country) {
            if (!this.application[target][country][subTarget]) {
                this.application[target][country][subTarget] = [];
            }
            this.application[target][country][subTarget].push(newItem);
        } else {
            if (!this.application[target]) {
                this.application[target] = [];
            }
            this.application[target].push(newItem);
        }
    }

    removeWorkExperience(country: string | null, target: string, index: number, subTarget: string = 'work_experience_list') {
        if (country) {
            this.application[target][country][subTarget].splice(index, 1);
        } else {
            this.application[target].splice(index, 1);
        }
    }

    onWorkToggle(country: string | null, target: string, subTarget: string = 'work_experience_list') {
        if (country) {
            const countryData = this.application[target][country];
            const hasWork = subTarget === 'current_work_experience_list' ? countryData.is_currently_working :
                           subTarget === 'other_work_experience_list' ? countryData.has_other_work :
                           countryData.has_work;

            if (hasWork && (!countryData[subTarget] || countryData[subTarget].length === 0)) {
                this.addWorkExperience(country, target, subTarget);
            }
        } else {
            const hasWork = target === 'work_experience_list' ? this.application.has_work_experience :
                target === 'other_work_experience_list' ? this.application.has_other_work_experience :
                    target === 'spouse_work_experience_list' ? this.application.spouse_has_work_experience :
                        this.application.spouse_has_other_work_experience;

            if (hasWork && (!this.application[target] || this.application[target].length === 0)) {
                this.addWorkExperience(null, target);
            }
        }
    }

    removeQualification(index: number) {
        this.application.education_data.additional.splice(index, 1);
    }

    hasInterest(type: 'study' | 'migration' | 'visa' | 'work' | 'coaching'): boolean {
        return !!(this.studentPrograms && this.studentPrograms[type] && this.studentPrograms[type].length > 0);
    }


    forceSyncPrograms() {
        if (confirm('This will overwrite current suggested programs. Continue?')) {
            this.suggestedPrograms = [];
            this.syncSuggestedPrograms();
        }
    }

    syncSuggestedPrograms() {
        if (!this.studentPrograms || this.suggestedPrograms.length > 0) return;

        const interests: any[] = [];
        (this.studentPrograms.study || []).forEach((p: any) => {
            const common = {
                type: 'STUDY',
                program: `STUDY ${p.country || ''}`.trim(),
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                branch_id: null,
                department_id: null,
                assigned_to: null,
                country: p.country || '',
                level: p.level || '',
                field: p.field || '',
                intake: p.intake || '',
                year: p.year || ''
            };
            interests.push({ ...common, subType: 'default', details: `${p.level || ''} ${p.field || ''} - ${p.intake || ''} ${p.year || ''}`.trim() });
        });
        (this.studentPrograms.migration || []).forEach((p: any) => {
            interests.push({
                type: 'MIGRATION',
                subType: 'default',
                program: `${p.country || ''}`,
                details: `${p.occupation || ''} - ${p.category || ''}`,
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                country: p.country || '',
                occupation: p.occupation || '',
                category: p.category || ''
            });
        });
        (this.studentPrograms.visa || []).forEach((p: any) => {
            interests.push({
                type: 'VISA',
                subType: 'default',
                program: `${p.country || ''}`,
                details: `${p.category || ''}`,
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                country: p.country || '',
                category: p.category || ''
            });
        });
        (this.studentPrograms.work || []).forEach((p: any) => {
            interests.push({
                type: 'WORK',
                subType: 'default',
                program: `${p.country || ''}`,
                details: `${p.occupation || ''}`,
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                country: p.country || '',
                occupation: p.occupation || ''
            });
        });
        (this.studentPrograms.coaching || []).forEach((p: any) => {
            interests.push({
                type: 'COACHING',
                subType: 'default',
                program: `COACHING`,
                details: `${p.course || ''} - ${p.batch || ''}`,
                status: '',
                sub_status: '',
                remarks: '',
                is_selected: true,
                course: p.course || '',
                batch: p.batch || ''
            });
        });

        this.suggestedPrograms = interests;
    }

    hasCountryInterest(countryName: string): boolean {
        // Check in suggested programs table
        if (this.suggestedPrograms && this.suggestedPrograms.length > 0) {
            return this.suggestedPrograms.some(p => p.country === countryName);
        }

        // Fallback to student profile data
        if (!this.studentPrograms) return false;
        const study = this.studentPrograms.study || [];
        const migration = this.studentPrograms.migration || [];
        const visa = this.studentPrograms.visa || [];
        const work = this.studentPrograms.work || [];

        return study.some((p: any) => p.country === countryName) ||
            migration.some((p: any) => p.country === countryName) ||
            visa.some((p: any) => p.country === countryName) ||
            work.some((p: any) => p.country === countryName);
    }

    onSave() {
        // Sync JSON data back to flat fields for hardcoded countries (Backward Compatibility)
        const countriesToSync = [
            { name: 'Canada', prefix: 'canadian' },
            { name: 'Australia', prefix: 'australian' },
            { name: 'New Zealand', prefix: 'nz' }
        ];

        countriesToSync.forEach(c => {
            const prefix = c.prefix;
            const name = c.name;

            // Sync Education
            if (this.application.education_data[name]) {
                this.application[`has_${prefix}_edu`] = this.application.education_data[name].has_edu;
                this.application[`${prefix}_edu_level`] = this.application.education_data[name].level;
                this.application[`${prefix}_edu_field`] = this.application.education_data[name].field;
            }

            // Sync Work Years (using migration_data for work years as unified source)
            if (this.application.migration_data[name]) {
                this.application[`${prefix}_work_years`] = this.application.migration_data[name].work_years;
            }

            // Sync Spouse fields
            if (this.application.migration_spouse_data[name]) {
                this.application[`spouse_${prefix}_edu`] = this.application.migration_spouse_data[name].has_edu;
                this.application[`spouse_${prefix}_work`] = this.application.migration_spouse_data[name].work_years;
            }
        });

        const data = {
            application: this.application,
            children: this.children,
            suggestedPrograms: this.suggestedPrograms
        };

        this.loadingService.show();
        this.studentService.saveStudentRegistration(this.studentId, data).subscribe({
            next: () => {
                this.dialogService.success('Registration saved successfully');
                this.loadingService.hide();
            },
            error: (err) => {
                this.dialogService.error('Error saving registration: ' + err.message);
                this.loadingService.hide();
            }
        });
    }

    onDobChange() {
        if (!this.application.dob) {
            this.application.age = null;
            return;
        }
        const birthDate = new Date(this.application.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        this.application.age = age;
    }

    goBack() {
        this.router.navigate(['/students/edit', this.studentId]);
    }
}
