import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-application-status-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './application-status-list.component.html',
    styleUrls: ['./settings-shared.css']
})
export class ApplicationStatusListComponent implements OnInit {
    items: any[] = [];
    newItemName = '';
    selectedCategories: string[] = [];
    categories = ['STUDY', 'MIGRATION', 'VISA', 'WORK', 'COACHING', 'OTHER'];

    isFormOpen = false;
    editingItem: any = null;

    constructor(
        private settingsService: SettingsService,
        private dialogService: DialogService
    ) { }

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.settingsService.getApplicationStatuses().subscribe(data => this.items = data);
    }

    onToggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (!this.isFormOpen) {
            this.newItemName = '';
            this.selectedCategories = [];
            this.editingItem = null;
        }
    }

    onToggleCategory(cat: string) {
        if (this.selectedCategories.includes(cat)) {
            this.selectedCategories = this.selectedCategories.filter(c => c !== cat);
        } else {
            this.selectedCategories.push(cat);
        }
    }

    isCategorySelected(cat: string): boolean {
        return this.selectedCategories.includes(cat);
    }

    onEditItem(item: any) {
        this.editingItem = item;
        this.newItemName = item.name;
        this.selectedCategories = [...(item.categories || [])];
        this.isFormOpen = true;
    }

    onAddItem() {
        if (!this.newItemName.trim() || this.selectedCategories.length === 0) {
            this.dialogService.warn('Please provide a name and select at least one category');
            return;
        }

        const payload = {
            status_id: this.editingItem ? this.editingItem.status_id : 0,
            name: this.newItemName.trim(),
            categories: this.selectedCategories
        };

        this.settingsService.saveApplicationStatus(payload).subscribe({
            next: () => {
                const msg = this.editingItem ? 'Status updated!' : 'Application Status added!';
                this.newItemName = '';
                this.selectedCategories = [];
                this.editingItem = null;
                this.isFormOpen = false;
                this.loadItems();
                this.dialogService.success(msg);
            },
            error: (err) => {
                this.dialogService.error('Failed to save status: ' + (err.error?.error || err.message));
            }
        });
    }

    onDeleteItem(id: number) {
        this.dialogService.confirm('Are you sure you want to delete this application status?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteApplicationStatus(id).subscribe({
                    next: () => {
                        this.loadItems();
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
