import { VaultStats } from "@shared";
import { create } from "zustand";

interface VaultStore {
  allVault: VaultStats | null;
  setAllVault: (list: VaultStats) => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  allVault: null,
  setAllVault: (list: VaultStats) =>
    set({
      allVault: list,
    }),
}));
