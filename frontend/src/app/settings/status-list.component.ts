import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-status-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './status-list.component.html',
    styleUrls: ['./settings-shared.css', './status-list.component.css']
})
export class StatusListComponent implements OnInit {
    statuses: any[] = [];

    // Management State
    newStatusName = '';
    requiresFollowup = true;
    isFormOpen = false;
    editingStatus: any = null;

    constructor(
        private settingsService: SettingsService,
        private dialogService: DialogService
    ) { }

    ngOnInit() {
        this.loadStatuses();
    }

    loadStatuses() {
        this.settingsService.getStatuses().subscribe(data => this.statuses = data);
    }

    onToggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (!this.isFormOpen) {
            this.newStatusName = '';
            this.requiresFollowup = true;
            this.editingStatus = null;
        }
    }

    onEditStatus(status: any) {
        this.editingStatus = status;
        this.newStatusName = status.status_name;
        this.requiresFollowup = status.requires_followup !== 0;
        this.isFormOpen = true;
    }

    onAddStatus() {
        if (!this.newStatusName.trim()) return;

        const payload = {
            status_id: this.editingStatus ? this.editingStatus.status_id : 0,
            status_name: this.newStatusName.trim(),
            requires_followup: this.requiresFollowup
        };

        this.settingsService.saveStatus(payload).subscribe({
            next: () => {
                const msg = this.editingStatus ? 'Status updated!' : 'Master Status added!';
                this.newStatusName = '';
                this.requiresFollowup = true;
                this.editingStatus = null;
                this.isFormOpen = false;
                this.loadStatuses();
                this.dialogService.success(msg);
            },
            error: (err) => {
                this.dialogService.error('Failed to save status: ' + (err.error?.error || err.message));
            }
        });
    }

    onDeleteStatus(id: number) {
        this.dialogService.confirm('Delete this master status? This will remove it from all departments and dropdowns.').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteStatus(id).subscribe({
                    next: () => {
                        this.loadStatuses();
                        this.dialogService.success('Status deleted!');
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete status. It might be in use.');
                    }
                });
            }
        });
    }
}
