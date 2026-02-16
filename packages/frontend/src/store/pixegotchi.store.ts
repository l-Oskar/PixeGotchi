import { create } from "zustand";

interface ActivePixegotchi {
  id: number | null;
  userId: number | null;
  name: string;
  level: number | null;
  experience: number | null;
  health: number | null;
  hunger: number | null;
  energy: number | null;
  happiness: number | null;
  cleanliness: number | null;
}

interface PixegotchiStore {
  activePixegotchi: ActivePixegotchi | null;
  setActive: (pixegotchi: ActivePixegotchi) => void;
}

export const pixegitchiStore = create<PixegotchiStore>((set) => ({
  activePixegotchi: null,
  setActive: (pixegotchi: ActivePixegotchi) =>
    set({
      activePixegotchi: pixegotchi,
    }),
}));
