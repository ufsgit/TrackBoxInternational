import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DialogData } from '../dialog.service';

@Component({
    selector: 'app-dialog',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="dialog-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
            <div class="dialog-card" [attr.data-type]="data?.type">
                <div class="dialog-header">
                    <div class="dialog-icon">
                        <span *ngIf="data?.type === 'success'">✔️</span>
                        <span *ngIf="data?.type === 'error'">❌</span>
                        <span *ngIf="data?.type === 'warning'">⚠️</span>
                        <span *ngIf="data?.type === 'info'">ℹ️</span>
                    </div>
                    <h3>{{ data?.title }}</h3>
                </div>
                <div class="dialog-body">
                    <p>{{ data?.message }}</p>
                </div>
                <div class="dialog-footer" [class.confirm-mode]="data?.isConfirm">
                    <ng-container *ngIf="data?.isConfirm; else dismissBtn">
                        <button class="btn btn-secondary" (click)="close(false)">Cancel</button>
                        <button class="btn btn-primary" (click)="close(true)">Confirm</button>
                    </ng-container>
                    <ng-template #dismissBtn>
                        <button class="btn btn-primary" (click)="close(true)">Dismiss</button>
                    </ng-template>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .dialog-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.15s ease-out;
        }

        .dialog-card {
            background: white;
            border-radius: 1.5rem;
            padding: 2.25rem;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            border: 1px solid var(--border);
            text-align: center;
            animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dialog-header { margin-bottom: 1.25rem; }
        .dialog-icon { font-size: 3rem; margin-bottom: 0.75rem; display: block; }
        .dialog-header h3 { font-size: 1.4rem; color: var(--secondary); margin: 0; letter-spacing: -0.01em; }
        .dialog-body { margin-bottom: 2rem; }
        .dialog-body p { color: var(--text-muted); font-size: 0.95rem; line-height: 1.6; margin: 0; }

        .dialog-footer { display: flex; gap: 0.75rem; justify-content: center; }
        .dialog-footer.confirm-mode { justify-content: space-between; }
        
        .btn {
            padding: 0.8rem 1.5rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
            flex: 1;
        }

        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-hover); transform: translateY(-1px); }
        
        .btn-secondary { background: #f1f5f9; color: var(--text-muted); border: 1px solid var(--border); }
        .btn-secondary:hover { background: #e2e8f0; color: var(--secondary); }

        /* Type Variations */
        .dialog-card[data-type="success"] .btn-primary { background: #10b981; }
        .dialog-card[data-type="success"] .btn-primary:hover { background: #059669; }
        
        .dialog-card[data-type="error"] .btn-primary { background: #ef4444; }
        .dialog-card[data-type="error"] .btn-primary:hover { background: #dc2626; }
        
        .dialog-card[data-type="warning"] .btn-primary { background: #f59e0b; }
        .dialog-card[data-type="warning"] .btn-primary:hover { background: #d97706; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    `]
})
export class DialogComponent implements OnInit {
    isVisible = false;
    data: DialogData | null = null;

    constructor(private dialogService: DialogService) { }

    ngOnInit() {
        this.dialogService.isVisible$.subscribe(v => this.isVisible = v);
        this.dialogService.data$.subscribe(d => this.data = d);
    }

    close(result: boolean = true) {
        this.dialogService.close(result);
    }

    onOverlayClick(event: MouseEvent) {
        if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
            this.close(false);
        }
    }
}
