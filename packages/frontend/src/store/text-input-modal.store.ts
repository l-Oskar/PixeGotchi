import { create } from "zustand";
import type { TextInputOptions } from "@/types/text-input-modal";

interface PendingTextInput extends TextInputOptions {
  id: number;
  resolve: (value: string | null) => void;
}

interface TextInputModalState {
  inputRequest: PendingTextInput | null;
  requestInput: (options: TextInputOptions) => Promise<string | null>;
  resolveInput: (value: string | null) => void;
}

let inputRequestSequence = 0;

export const useTextInputModalStore = create<TextInputModalState>(
  (set, get) => ({
    inputRequest: null,
    requestInput: (options) =>
      new Promise<string | null>((resolve) => {
        get().inputRequest?.resolve(null);
        inputRequestSequence += 1;
        set({
          inputRequest: {
            ...options,
            id: inputRequestSequence,
            resolve,
          },
        });
      }),
    resolveInput: (value) => {
      const inputRequest = get().inputRequest;
      if (!inputRequest) return;

      set({ inputRequest: null });
      inputRequest.resolve(value);
    },
  }),
);
