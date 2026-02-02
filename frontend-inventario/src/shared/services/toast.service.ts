import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertPosition } from 'sweetalert2';

export interface ToastOptions {
  title: string;
  text?: string;
  icon: SweetAlertIcon;                 // 'success' | 'error' | 'warning' | 'info' | 'question'
  position?: SweetAlertPosition;        // 'top-end', 'top', 'bottom-end', etc.
  timer?: number;                       // ms
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private defaultPosition: SweetAlertPosition = 'top-end';
  private defaultTimer = 2200;

  private baseToast(options?: Partial<ToastOptions>) {
    return Swal.mixin({
      toast: true,
      position: options?.position ?? this.defaultPosition,
      showConfirmButton: false,
      timer: options?.timer ?? this.defaultTimer,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }

  show(opt: ToastOptions) {
    return this.baseToast(opt).fire({
      icon: opt.icon,
      title: opt.title,
      text: opt.text
    });
  }

  success(title: string, text?: string, timer?: number) {
    return this.show({ icon: 'success', title, text, timer });
  }

  warning(title: string, text?: string, timer?: number) {
    return this.show({ icon: 'warning', title, text, timer });
  }

  error(title: string, text?: string, timer?: number) {
    return this.show({ icon: 'error', title, text, timer });
  }

  info(title: string, text?: string, timer?: number) {
    return this.show({ icon: 'info', title, text, timer });
  }
}
