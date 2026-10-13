export interface ToastMessage {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

class ToastStore {
  toasts = $state<ToastMessage[]>([]);

  show(message: string, type: ToastMessage['type'] = 'success', duration = 3000): void {
    const id = Math.random().toString(36).slice(2, 9);
    const toast: ToastMessage = { id, message, type };
    this.toasts = [...this.toasts, toast];

    setTimeout(() => {
      this.dismiss(id);
    }, duration);
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
  }
}

export const toastStore = new ToastStore();
