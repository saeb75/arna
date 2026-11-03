import { create } from "zustand";

export interface Toast {
  id: string;
  kind: "success" | "error" | "info";
  title: string;
  description?: string;
}

/** Üstte beliren kısa mesajlar — yalnız ToastController yazar. */
interface ToastState {
  toasts: Toast[];
  setToasts: (toasts: Toast[]) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  setToasts: (toasts) => set({ toasts }),
}));
