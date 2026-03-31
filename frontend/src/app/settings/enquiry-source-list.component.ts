import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../shared/settings.service';
import { DialogService } from '../shared/dialog.service';

@Component({
    selector: 'app-enquiry-source-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './enquiry-source-list.component.html',
    styleUrls: ['./settings-shared.css', './enquiry-source-list.component.css']
})
export class EnquirySourceListComponent implements OnInit {
    sources: any[] = [];
    showModal = false;
    currentSource: any = { source_id: 0, source_name: '' };

    constructor(
        private settingsService: SettingsService,
        private dialogService: DialogService
    ) { }

    ngOnInit() {
        this.loadSources();
    }

    loadSources() {
        this.settingsService.getEnquirySources().subscribe(data => this.sources = data);
    }

    openModal(source?: any) {
        if (source) {
            this.currentSource = { ...source };
        } else {
            this.currentSource = { source_id: 0, source_name: '' };
        }
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    onSave() {
        if (!this.currentSource.source_name) {
            this.dialogService.warn('Source Name is required!');
            return;
        }

        this.settingsService.saveEnquirySource(this.currentSource).subscribe({
            next: () => {
                this.dialogService.success('Enquiry source saved successfully!');
                this.loadSources();
                this.closeModal();
            },
            error: (err) => {
                this.dialogService.error('Failed to save source: ' + (err.error?.error || err.message));
            }
        });
    }

    onDelete(id: number) {
        this.dialogService.confirm('Are you sure you want to delete this enquiry source?').subscribe(ok => {
            if (ok) {
                this.settingsService.deleteEnquirySource(id).subscribe({
                    next: () => {
                        this.dialogService.success('Source deleted successfully!');
                        this.loadSources();
                    },
                    error: (err) => {
                        this.dialogService.error('Failed to delete source. It might be in use.');
                    }
                });
            }
        });
    }
}
