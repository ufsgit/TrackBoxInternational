import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../shared/dialog.service';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-generic-master-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="settings-container">
        <header class="settings-header">
            <div class="header-info">
                <h1>{{title}}</h1>
                <p>{{description}}</p>
            </div>
            <button class="btn btn-primary" (click)="openModal()">
                <span class="icon">➕</span> Add New {{itemName}}
            </button>
        </header>

        <div class="grid-card">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>{{itemName}} Name</th>
                        <th class="text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let item of items">
                        <td>#{{item[idField]}}</td>
                        <td class="font-bold">{{item.name}}</td>
                        <td class="text-right">
                            <button class="icon-btn edit-btn" (click)="openModal(item)" title="Edit">✏️</button>
                            <button class="icon-btn delete-btn" (click)="onDelete(item[idField])" title="Delete">🗑️</button>
                        </td>
                    </tr>
                    <tr *ngIf="items.length === 0">
                        <td colspan="3" class="text-center py-20 t-muted">No {{itemName.toLowerCase()}} records found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal">
        <div class="modal-content settings-modal">
            <div class="modal-header">
                <h3>{{currentItem.id ? 'Edit' : 'Add New'}} {{itemName}}</h3>
                <button class="close-modal" (click)="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>{{itemName}} Name <span class="required">*</span></label>
                    <input type="text" [(ngModel)]="currentItem.name" [placeholder]="'e.g. ' + itemName + ' Name'"
                        class="form-control">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" (click)="closeModal()">Cancel</button>
                <button class="btn btn-save" (click)="onSave()">{{currentItem.id ? 'Update' : 'Create'}}
                    {{itemName}}</button>
            </div>
        </div>
    </div>
    `,
    styleUrls: ['./settings-shared.css']
})
export class GenericMasterListComponent implements OnInit {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() itemName: string = '';
    @Input() idField: string = '';
    @Input() loadFn!: () => Observable<any[]>;
    @Input() saveFn!: (data: any) => Observable<any>;
    @Input() deleteFn!: (id: number) => Observable<any>;

    items: any[] = [];
    showModal = false;
    currentItem: any = { id: 0, name: '' };

    constructor(private dialogService: DialogService) { }

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.loadFn().subscribe(data => this.items = data);
    }

    openModal(item?: any) {
        if (item) {
            this.currentItem = { id: item[this.idField], name: item.name };
        } else {
            this.currentItem = { id: 0, name: '' };
        }
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    onSave() {
        if (!this.currentItem.name) {
            this.dialogService.warn(`${this.itemName} Name is required!`);
            return;
        }

        this.saveFn(this.currentItem).subscribe({
            next: () => {
                this.dialogService.success(`${this.itemName} saved successfully!`);
                this.loadItems();
                this.closeModal();
            },
            error: (err: any) => {
                this.dialogService.error(`Failed to save ${this.itemName.toLowerCase()}: ` + (err.error?.error || err.message));
            }
        });
    }

    onDelete(id: number) {
        this.dialogService.confirm(`Are you sure you want to delete this ${this.itemName.toLowerCase()}?`).subscribe(ok => {
            if (ok) {
                this.deleteFn(id).subscribe({
                    next: () => {
                        this.dialogService.success(`${this.itemName} deleted successfully!`);
                        this.loadItems();
                    },
                    error: (err: any) => {
                        this.dialogService.error(`Failed to delete ${this.itemName.toLowerCase()}. It might be in use.`);
                    }
                });
            }
        });
    }
}
