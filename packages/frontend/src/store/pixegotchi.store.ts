import { create } from "zustand";
import { Pixegotchi } from "@pixegotchi/shared";

interface PixegotchiStore {
  currentPixegotchi: Pixegotchi | null;
  allPixegotchi: Pixegotchi[] | [];
  setAllPixegotchi: (pixegotchi: Pixegotchi[]) => void;
  setCurrent: (pixegotchi: Pixegotchi) => void;
  clearCurrent: () => void;
}

export const usePixegotchiStore = create<PixegotchiStore>((set) => ({
  currentPixegotchi: null,
  allPixegotchi: [],
  setAllPixegotchi: (list: Pixegotchi[]) =>
    set({
      allPixegotchi: list,
    }),
  setCurrent: (pixegotchi: Pixegotchi) =>
    set({
      currentPixegotchi: pixegotchi,
    }),
  clearCurrent: () =>
    set({
      currentPixegotchi: null,
    }),
}));
