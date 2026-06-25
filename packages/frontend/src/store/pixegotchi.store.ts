import { create } from "zustand";
import { Pixegotchi } from "@pixegotchi/shared";

interface PixegotchiStore {
  activePixegotchi: Pixegotchi | null;
  allPixegotchi: Pixegotchi[] | [];
  setAllPixegotchi: (pixegotchi: Pixegotchi[]) => void;
  setActive: (pixegotchi: Pixegotchi) => void;
  setToVault: () => void;
}

export const usePixegotchiStore = create<PixegotchiStore>((set) => ({
  activePixegotchi: null,
  allPixegotchi: [],
  setAllPixegotchi: (list: Pixegotchi[]) =>
    set({
      allPixegotchi: list,
    }),
  setActive: (pixegotchi: Pixegotchi) =>
    set({
      activePixegotchi: pixegotchi,
    }),
  setToVault: () =>
    set({
      activePixegotchi: null,
    }),
}));
