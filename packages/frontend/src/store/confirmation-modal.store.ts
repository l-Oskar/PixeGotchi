import { create } from "zustand";
import type { ConfirmationOptions } from "@/types/confirmation-modal";

interface PendingConfirmation extends ConfirmationOptions {
  resolve: (confirmed: boolean) => void;
}

interface ConfirmationModalState {
  confirmation: PendingConfirmation | null;
  requestConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
  resolveConfirmation: (confirmed: boolean) => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>(
  (set, get) => ({
    confirmation: null,
    requestConfirmation: (options) =>
      new Promise<boolean>((resolve) => {
        get().confirmation?.resolve(false);
        set({ confirmation: { ...options, resolve } });
      }),
    resolveConfirmation: (confirmed) => {
      const confirmation = get().confirmation;
      if (!confirmation) return;

      set({ confirmation: null });
      confirmation.resolve(confirmed);
    },
  }),
);
