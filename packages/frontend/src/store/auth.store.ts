import { create } from "zustand";
import { useUserStore } from "./user.store";
interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  setAuth: (token) => {
    set({
      accessToken: token,
      isAuthenticated: true,
    });
  },

  logout: () =>
    set({
      accessToken: null,
      isAuthenticated: false,
    }),
}));

export const logout = () => {
  useAuthStore.getState().logout();
  useUserStore.getState().clearUser();
};
