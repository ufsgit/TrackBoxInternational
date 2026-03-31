import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-application-sub-status-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './application-sub-status-list.component.html',
    styleUrls: ['./settings-shared.css']
})
export class ApplicationSubStatusListComponent implements OnInit {
    items: any[] = [];
    parentStatuses: any[] = [];

    // Form State
    isFormOpen = false;
    editingItem: any = null;
    formModel = {
        sub_status_id: 0,
        status_id: '',
        name: ''
    };

    constructor(
        private settingsService: SettingsService,
        private dialogService: DialogService
    ) { }

    ngOnInit() {
        this.loadItems();
        this.loadParentStatuses();
    }

    loadItems() {
        this.settingsService.getApplicationSubStatuses().subscribe(data => this.items = data);
    }

    loadParentStatuses() {
        this.settingsService.getApplicationStatuses().subscribe(data => this.parentStatuses = data);
    }

    onToggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (!this.isFormOpen) {
            this.resetForm();
        }
    }

    resetForm() {
        this.formModel = {
            sub_status_id: 0,
            status_id: '',
            name: ''
        };
        this.editingItem = null;
    }

    onEditItem(item: any) {
        this.editingItem = item;
        this.formModel = {
            sub_status_id: item.sub_status_id,
            status_id: item.status_id,
            name: item.name
        };
        this.isFormOpen = true;
    }

    onAddItem() {
        if (!this.formModel.name.trim() || !this.formModel.status_id) {
            this.dialogService.warn('Please fill all required fields');
            return;
        }

        this.settingsService.saveApplicationSubStatus(this.formModel).subscribe({
            next: () => {
                const msg = this.editingItem ? 'Sub-status updated!' : 'Sub-status added!';
                this.resetForm();
                this.isFormOpen = false;
                this.loadItems();
                this.dialogService.success(msg);
            },
            error: (err) => {
                this.dialogService.error('Failed to save sub-status: ' + (err.error?.error || err.message));
            }
        });
    }

    onDeleteItem(id: number) {
        this.dialogService.confirm('Delete this sub-status?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteApplicationSubStatus(id).subscribe({
                    next: () => {
                        this.loadItems();
                        this.dialogService.success('Sub-status deleted!');
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete sub-status.');
                    }
                });
            }
        });
    }
}
