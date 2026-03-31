import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type DialogType = 'success' | 'error' | 'warning' | 'info';

export interface DialogData {
    title: string;
    message: string;
    type: DialogType;
    onClose?: () => void;
    onConfirm?: () => void;
    isConfirm?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
    private dialogVisibility = new BehaviorSubject<boolean>(false);
    private dialogData = new BehaviorSubject<DialogData | null>(null);
    private confirmCallback: ((result: boolean) => void) | null = null;

    public isVisible$: Observable<boolean> = this.dialogVisibility.asObservable();
    public data$: Observable<DialogData | null> = this.dialogData.asObservable();

    show(data: DialogData) {
        this.dialogData.next(data);
        this.dialogVisibility.next(true);
    }

    success(message: string, title: string = 'Success', onClose?: () => void) {
        this.show({ title, message, type: 'success', onClose });
    }

    error(message: string, title: string = 'Error', onClose?: () => void) {
        this.show({ title, message, type: 'error', onClose });
    }

    warn(message: string, title: string = 'Warning', onClose?: () => void) {
        this.show({ title, message, type: 'warning', onClose });
    }

    info(message: string, title: string = 'Information', onClose?: () => void) {
        this.show({ title, message, type: 'info', onClose });
    }

    confirm(message: string, title: string = 'Confirm Action'): Observable<boolean> {
        return new Observable<boolean>(observer => {
            this.confirmCallback = (result: boolean) => {
                observer.next(result);
                observer.complete();
            };
            this.show({ title, message, type: 'info', isConfirm: true });
        });
    }

    close(result: boolean = true) {
        const currentData = this.dialogData.value;
        this.dialogVisibility.next(false);

        if (currentData?.isConfirm && this.confirmCallback) {
            this.confirmCallback(result);
            this.confirmCallback = null;
        }

        if (currentData?.onClose) {
            currentData.onClose();
        }
    }
}
