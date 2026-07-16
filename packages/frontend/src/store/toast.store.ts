import { create } from "zustand";
import type { ToastDetails, ToastInput } from "@/types/toast";

const MAX_VISIBLE_TOASTS = 3;
let toastSequence = 0;

interface ToastState {
  toasts: ToastDetails[];
  addToast: (toast: ToastInput) => string;
  dismissToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    toastSequence += 1;
    const id = `toast-${toastSequence}`;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }].slice(-MAX_VISIBLE_TOASTS),
    }));

    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}));
