import { useEffect, type ReactNode } from "react";

import { useUiStore } from "@/store/ui.store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const isLightTheme = useUiStore((state) => state.isLightTheme);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "pixel-light-theme",
      isLightTheme,
    );
  }, [isLightTheme]);

  return <>{children}</>;
}
