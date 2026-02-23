import { create } from "zustand";
import { Pixegotchi } from "@shared";

interface PixegotchiStore {
  activePixegotchi: Pixegotchi | null;
  setActive: (pixegotchi: Pixegotchi) => void;
  setToVault: (pixegotchi: Pixegotchi) => void;
}

export const usePixegotchiStore = create<PixegotchiStore>((set) => ({
  activePixegotchi: null,
  setActive: (pixegotchi: Pixegotchi) =>
    set({
      activePixegotchi: pixegotchi,
    }),
  setToVault: () =>
    set({
      activePixegotchi: null,
    }),
}));
