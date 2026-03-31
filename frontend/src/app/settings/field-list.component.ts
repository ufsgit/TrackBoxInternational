import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-field-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './field-list.component.html',
    styleUrls: ['./settings-shared.css']
})
export class FieldListComponent implements OnInit {
    items: any[] = [];
    newItemName = '';
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
        this.settingsService.getStudyFields().subscribe(data => this.items = data);
    }

    onToggleForm() {
        this.isFormOpen = !this.isFormOpen;
        if (!this.isFormOpen) {
            this.newItemName = '';
            this.editingItem = null;
        }
    }

    onEditItem(item: any) {
        this.editingItem = item;
        this.newItemName = item.name;
        this.isFormOpen = true;
    }

    onAddItem() {
        if (!this.newItemName.trim()) return;

        const payload = {
            field_id: this.editingItem ? this.editingItem.field_id : 0,
            name: this.newItemName.trim()
        };

        this.settingsService.saveStudyField(payload).subscribe({
            next: () => {
                const msg = this.editingItem ? 'Field updated!' : 'Study Field added!';
                this.newItemName = '';
                this.editingItem = null;
                this.isFormOpen = false;
                this.loadItems();
                this.dialogService.success(msg);
            },
            error: (err) => {
                this.dialogService.error('Failed to save field: ' + (err.error?.error || err.message));
            }
        });
    }

    onDeleteItem(id: number) {
        this.dialogService.confirm('Delete this study field?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteStudyField(id).subscribe({
                    next: () => {
                        this.loadItems();
                        this.dialogService.success('Field deleted!');
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete field. It might be in use.');
                    }
                });
            }
        });
    }
}
