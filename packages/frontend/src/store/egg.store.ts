import { create } from "zustand";
import { Egg } from "@shared";

export interface EggStore {
  hatchingEgg: Egg | null;
  setHatchingEgg: (egg: Egg) => void;
  hatchEgg: () => void;
}

export const useEggStore = create<EggStore>((set) => ({
  hatchingEgg: null,
  setHatchingEgg: (egg: Egg) => set({ hatchingEgg: egg }),
  hatchEgg: () =>
    set({
      hatchingEgg: null,
    }),
}));
