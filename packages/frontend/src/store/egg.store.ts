import { create } from "zustand";
import { Egg } from "@pixegotchi/shared";

export interface EggStore {
  allEggs: Egg[] | [];
  chosenEgg: Egg | null;
  hatchingEgg: Egg | null;
  setAllEggs: (list: Egg[]) => void;
  setChosenEgg: (egg: Egg) => void;
  setHatchingEgg: (egg: Egg) => void;
  clearEgg: () => void;
}

export const useEggStore = create<EggStore>((set) => ({
  hatchingEgg: null,
  chosenEgg: null,
  allEggs: [],
  setAllEggs: (list: Egg[] | []) =>
    set({ allEggs: [...list].sort((a, b) => a.id - b.id) }),
  setChosenEgg: (egg: Egg) => set({ chosenEgg: egg }),
  setHatchingEgg: (egg: Egg) => set({ hatchingEgg: egg }),
  clearEgg: () =>
    set({
      hatchingEgg: null,
    }),
}));
