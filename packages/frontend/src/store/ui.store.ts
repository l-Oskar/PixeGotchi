import { create } from "zustand";

interface UiState {
  isHeaderMenuOpen: boolean;
  isLightTheme: boolean;
  setHeaderMenuOpen: (isOpen: boolean) => void;
  setLightTheme: (isLightTheme: boolean) => void;
  toggleHeaderMenu: () => void;
  toggleTheme: () => void;
}

const getInitialLightTheme = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("pixel-light-theme");

export const useUiStore = create<UiState>((set) => ({
  isHeaderMenuOpen: false,
  isLightTheme: getInitialLightTheme(),
  setHeaderMenuOpen: (isOpen) => set({ isHeaderMenuOpen: isOpen }),
  setLightTheme: (isLightTheme) => set({ isLightTheme }),
  toggleHeaderMenu: () =>
    set((state) => ({ isHeaderMenuOpen: !state.isHeaderMenuOpen })),
  toggleTheme: () =>
    set((state) => ({ isLightTheme: !state.isLightTheme })),
}));
