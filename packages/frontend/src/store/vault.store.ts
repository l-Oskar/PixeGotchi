import { VaultStats } from "@shared";
import { create } from "zustand";

interface VaultStore {
  allVault: VaultStats[] | [];
  setAllVault: (list: VaultStats[]) => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  allVault: [],
  setAllVault: (list: VaultStats[]) =>
    set({
      allVault: list,
    }),
}));
