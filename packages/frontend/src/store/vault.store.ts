import { Pixegotchi, VaultStats } from "@shared";
import { create } from "zustand";

interface VaultStore {
  allVault: VaultStats | null;
  statsVault: Pixegotchi[] | [] | null;
  setAllVault: (list: VaultStats) => void;
  setStatsVault: (list: Pixegotchi[] | []) => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  allVault: null,
  statsVault: null,
  setAllVault: (list: VaultStats) =>
    set({
      allVault: list,
    }),
  setStatsVault: (list: Pixegotchi[] | []) =>
    set({
      statsVault: list,
    }),
}));
