import { Pixegotchi, VaultStats } from "@pixegotchi/shared";
import { create } from "zustand";

interface VaultStore {
  statsVault: VaultStats | null;
  allVault: Pixegotchi[] | [] | null;
  setStatsVault: (list: VaultStats) => void;
  setAllVault: (list: Pixegotchi[] | []) => void;
}

export const useVaultStore = create<VaultStore>((set) => ({
  allVault: null,
  statsVault: null,
  setStatsVault: (list: VaultStats) =>
    set({
      statsVault: list,
    }),
  setAllVault: (list: Pixegotchi[] | []) =>
    set({
      allVault: list,
    }),
}));
