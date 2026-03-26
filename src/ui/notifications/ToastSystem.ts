export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'kill';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly type: ToastType;
  readonly startTime: number;
  readonly duration: number;
}

let toastCounter = 0;

/** Create a toast notification. */
export function createToast(message: string, type: ToastType = 'info', duration = 3000): Toast {
  toastCounter += 1;
  return { id: `toast-${toastCounter}`, message, type, startTime: performance.now(), duration };
}

/** Check if toast is still visible. */
export function isToastVisible(toast: Toast): boolean {
  return performance.now() - toast.startTime < toast.duration;
}

/** Get toast opacity (fades in last 500ms). */
export function getToastOpacity(toast: Toast): number {
  const elapsed = performance.now() - toast.startTime;
  const remaining = toast.duration - elapsed;
  if (remaining <= 0) return 0;
  if (remaining < 500) return remaining / 500;
  if (elapsed < 200) return elapsed / 200;
  return 1;
}

/** Get color for toast type. */
export function getToastColor(type: ToastType): string {
  switch (type) {
    case 'info':
      return '#3498db';
    case 'success':
      return '#2ecc71';
    case 'warning':
      return '#f39c12';
    case 'error':
      return '#e74c3c';
    case 'kill':
      return '#ff4444';
  }
}

/** Manage a toast queue — add, remove expired, get visible. */
export class ToastManager {
  private toasts: Toast[] = [];

  add(message: string, type: ToastType = 'info', duration = 3000): Toast {
    const toast = createToast(message, type, duration);
    this.toasts.push(toast);
    return toast;
  }

  getVisible(): readonly Toast[] {
    this.toasts = this.toasts.filter(isToastVisible);
    return this.toasts;
  }

  clear(): void {
    this.toasts = [];
  }

  get count(): number {
    return this.toasts.filter(isToastVisible).length;
  }
}
