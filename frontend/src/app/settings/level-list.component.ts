import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-level-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './level-list.component.html',
    styleUrls: ['./settings-shared.css']
})
export class LevelListComponent implements OnInit {
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
        this.settingsService.getEducationalLevels().subscribe(data => this.items = data);
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
            level_id: this.editingItem ? this.editingItem.level_id : 0,
            name: this.newItemName.trim()
        };

        this.settingsService.saveEducationalLevel(payload).subscribe({
            next: () => {
                const msg = this.editingItem ? 'Level updated!' : 'Education Level added!';
                this.newItemName = '';
                this.editingItem = null;
                this.isFormOpen = false;
                this.loadItems();
                this.dialogService.success(msg);
            },
            error: (err) => {
                this.dialogService.error('Failed to save level: ' + (err.error?.error || err.message));
            }
        });
    }

    onDeleteItem(id: number) {
        this.dialogService.confirm('Delete this education level?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteEducationalLevel(id).subscribe({
                    next: () => {
                        this.loadItems();
                        this.dialogService.success('Level deleted!');
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete level. It might be in use.');
                    }
                });
            }
        });
    }
}
