import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-branch-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './branch-list.component.html',
    styleUrls: ['./settings-shared.css', './branch-list.component.css']
})
export class BranchListComponent implements OnInit {
    branches: any[] = [];
    departments: any[] = [];

    // Selection State
    selectedBranch: any = null;
    mappedDeptIds: number[] = [];

    // Form/Modal State
    isFormOpen = false;
    isMappingOpen = false;
    branchForm: any = { branch_id: 0, branch_name: '' };

    constructor(
        private settingsService: SettingsService,
        private dialogService: DialogService
    ) { }

    ngOnInit() {
        this.loadBranches();
        this.loadDepartments();
    }

    loadBranches() {
        this.settingsService.getBranches().subscribe(data => this.branches = data);
    }

    loadDepartments() {
        this.settingsService.getDepartments().subscribe(data => this.departments = data);
    }

    // --- Actions ---

    onToggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (!this.isFormOpen) {
            this.branchForm = { branch_id: 0, branch_name: '' };
        }
    }

    onToggleMapping(branch: any = null) {
        if (branch) {
            this.selectedBranch = branch;
            this.loadBranchDepartments(branch.branch_id);
            this.isMappingOpen = true;
        } else {
            this.isMappingOpen = false;
            this.selectedBranch = null;
            this.mappedDeptIds = [];
        }
    }

    onEditBranch(branch: any) {
        this.selectedBranch = branch;
        this.branchForm = { ...branch };
        this.isFormOpen = true;
    }

    onNewBranch() {
        this.selectedBranch = null;
        this.branchForm = { branch_id: 0, branch_name: '' };
        this.isFormOpen = true;
    }

    // --- Branch Form ---

    onSaveBranch() {
        if (!this.branchForm.branch_name) {
            this.dialogService.warn('Branch Name is required!');
            return;
        }

        this.settingsService.saveBranch(this.branchForm).subscribe({
            next: () => {
                this.dialogService.success('Branch saved successfully!');
                this.isFormOpen = false;
                this.selectedBranch = null;
                this.loadBranches();
            },
            error: (err) => {
                this.dialogService.error('Failed to save branch: ' + (err.error?.error || err.message));
            }
        });
    }

    onDelete(id: number, event: Event) {
        event.stopPropagation();
        this.dialogService.confirm('Delete this branch?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteBranch(id).subscribe({
                    next: () => {
                        this.dialogService.success('Branch deleted!');
                        this.isFormOpen = false;
                        this.selectedBranch = null;
                        this.loadBranches();
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete branch.');
                    }
                });
            }
        });
    }

    // --- Department Mapping ---

    loadBranchDepartments(branchId: number) {
        this.settingsService.getBranchDepartments(branchId).subscribe(data => {
            this.mappedDeptIds = data.map(d => d.department_id);
        });
    }

    toggleDepartment(deptId: number, event: any) {
        if (event.target.checked) {
            this.mappedDeptIds.push(deptId);
        } else {
            this.mappedDeptIds = this.mappedDeptIds.filter(id => id !== deptId);
        }
    }

    isDeptMapped(deptId: number): boolean {
        return this.mappedDeptIds.includes(deptId);
    }

    onSaveMappings() {
        if (!this.selectedBranch) return;

        this.settingsService.updateBranchDepartments(this.selectedBranch.branch_id, this.mappedDeptIds).subscribe({
            next: () => {
                this.dialogService.success('Target departments updated for this branch!');
            },
            error: (err) => {
                this.dialogService.error('Failed to update mappings.');
            }
        });
    }
}
