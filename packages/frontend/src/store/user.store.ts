import { User } from "@shared";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateBallance: (balance: string) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  clearUser: () => set({ user: null }),
  updateBallance: (newBalance) =>
    set((state) => ({
      user: state.user ? { ...state.user, pgcBalance: newBalance } : null,
    })),
}));
