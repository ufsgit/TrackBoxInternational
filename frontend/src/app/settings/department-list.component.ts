import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-department-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './department-list.component.html',
    styleUrls: ['./settings-shared.css', './department-list.component.css']
})
export class DepartmentListComponent implements OnInit {
    departments: any[] = [];
    masterStatuses: any[] = []; // All available master statuses

    // Selection State
    selectedDept: any = null;
    mappedStatusIds: number[] = [];

    // Form/Modal State
    isFormOpen = false;
    isMappingOpen = false;
    deptForm: any = { department_id: 0, department_name: '' };

    constructor(
        private settingsService: SettingsService,
        private dialogService: DialogService
    ) { }

    ngOnInit() {
        this.loadDepartments();
        this.loadMasterStatuses();
    }

    loadDepartments() {
        this.settingsService.getDepartments().subscribe(data => this.departments = data);
    }

    loadMasterStatuses() {
        this.settingsService.getStatuses().subscribe(data => this.masterStatuses = data);
    }

    // --- Actions ---

    onToggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (!this.isFormOpen) {
            this.deptForm = { department_id: 0, department_name: '' };
        }
    }

    onToggleMapping(dept: any = null) {
        if (dept) {
            this.selectedDept = dept;
            this.loadDepartmentStatuses(dept.department_id);
            this.isMappingOpen = true;
        } else {
            this.isMappingOpen = false;
            this.selectedDept = null;
            this.mappedStatusIds = [];
        }
    }

    onEditDept(dept: any) {
        this.selectedDept = dept;
        this.deptForm = { ...dept };
        this.isFormOpen = true;
    }

    onNewDept() {
        this.selectedDept = null;
        this.deptForm = { department_id: 0, department_name: '' };
        this.isFormOpen = true;
    }

    // --- Department Form ---

    onSaveDept() {
        if (!this.deptForm.department_name) {
            this.dialogService.warn('Department Name is required!');
            return;
        }

        const isNew = this.deptForm.department_id === 0;

        this.settingsService.saveDepartment(this.deptForm).subscribe({
            next: () => {
                this.dialogService.success('Department saved successfully!');
                this.isFormOpen = false;
                this.selectedDept = null;
                this.loadDepartments();
            },
            error: (err) => {
                this.dialogService.error('Failed to save department: ' + (err.error?.error || err.message));
            }
        });
    }

    onDeleteDept(id: number, event: Event) {
        event.stopPropagation();
        this.dialogService.confirm('Delete this department?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteDepartment(id).subscribe({
                    next: () => {
                        this.dialogService.success('Department deleted!');
                        this.isFormOpen = false;
                        this.selectedDept = null;
                        this.loadDepartments();
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete department. It might be in use.');
                    }
                });
            }
        });
    }

    // --- Status Mapping (Right Side) ---

    loadDepartmentStatuses(deptId: number) {
        this.settingsService.getDepartmentStatuses(deptId).subscribe(data => {
            this.mappedStatusIds = data.map(s => s.status_id);
        });
    }

    toggleStatus(statusId: number, event: any) {
        if (event.target.checked) {
            this.mappedStatusIds.push(statusId);
        } else {
            this.mappedStatusIds = this.mappedStatusIds.filter(id => id !== statusId);
        }
    }

    isStatusMapped(statusId: number): boolean {
        return this.mappedStatusIds.includes(statusId);
    }

    onSaveMappings() {
        if (!this.selectedDept) return;

        this.settingsService.updateDepartmentStatuses(this.selectedDept.department_id, this.mappedStatusIds).subscribe({
            next: () => {
                this.dialogService.success('Department statuses updated!');
            },
            error: (err) => {
                this.dialogService.error('Failed to update status mappings.');
            }
        });
    }
}
