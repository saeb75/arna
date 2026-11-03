import { useToastStore, type Toast } from "../stores/useToastStore";

const SHOW_MS = 3200;
const MAX = 3;
let seq = 0;

/** Üstte kısa mesajlar. Tam ekran modal (paywall) üstünde görünmez — orada Alert kullanılır. */
export class ToastController {
  static success(title: string, description?: string): void {
    this.show({ kind: "success", title, description });
  }

  static info(title: string, description?: string): void {
    this.show({ kind: "info", title, description });
  }

  static error(title: string, description?: string): void {
    this.show({ kind: "error", title, description });
  }

  static dismiss(id: string): void {
    const s = useToastStore.getState();
    s.setToasts(s.toasts.filter((t) => t.id !== id));
  }

  private static show(toast: Omit<Toast, "id">): void {
    const id = `t${++seq}`;
    const s = useToastStore.getState();
    s.setToasts([{ ...toast, id }, ...s.toasts].slice(0, MAX));
    setTimeout(() => this.dismiss(id), SHOW_MS);
  }
}
