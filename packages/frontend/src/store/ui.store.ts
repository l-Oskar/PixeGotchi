import { create } from "zustand";

const THEME_STORAGE_KEY = "pixegotchi-theme";

interface UiState {
  isHeaderMenuOpen: boolean;
  isLightTheme: boolean;
  setHeaderMenuOpen: (isOpen: boolean) => void;
  setLightTheme: (isLightTheme: boolean) => void;
  toggleHeaderMenu: () => void;
  toggleTheme: () => void;
}

const getInitialLightTheme = () => {
  if (typeof localStorage !== "undefined") {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (storedTheme) {
      return storedTheme === "light";
    }
  }

  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("pixel-light-theme")
  );
};

const storeThemePreference = (isLightTheme: boolean) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_STORAGE_KEY, isLightTheme ? "light" : "dark");
  }
};

export const useUiStore = create<UiState>((set) => ({
  isHeaderMenuOpen: false,
  isLightTheme: getInitialLightTheme(),
  setHeaderMenuOpen: (isOpen) => set({ isHeaderMenuOpen: isOpen }),
  setLightTheme: (isLightTheme) => {
    storeThemePreference(isLightTheme);
    set({ isLightTheme });
  },
  toggleHeaderMenu: () =>
    set((state) => ({ isHeaderMenuOpen: !state.isHeaderMenuOpen })),
  toggleTheme: () =>
    set((state) => {
      const isLightTheme = !state.isLightTheme;
      storeThemePreference(isLightTheme);

      return { isLightTheme };
    }),
}));
