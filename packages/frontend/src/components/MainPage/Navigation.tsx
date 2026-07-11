import React from "react";
import { Heart, ShoppingBag, Gamepad2, Vault, Store, Egg } from "lucide-react";
import { PageType } from "@pixegotchi/shared";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { useEggStore } from "@/store/egg.store";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";

export interface NavigationProps {
  currentPage: PageType;
  isHidden?: boolean;
  setCurrentPage: (currentPage: PageType) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  isHidden = false,
  setCurrentPage,
}) => {
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);
  const hatchingEgg = useEggStore((s) => s.hatchingEgg);
  const safeAreaInsetBottom = useSignal(viewport.safeAreaInsetBottom);
  const contentSafeAreaInsetBottom = useSignal(
    viewport.contentSafeAreaInsetBottom,
  );
  const bottomInset = Math.max(
    0,
    (safeAreaInsetBottom ?? 0) + (contentSafeAreaInsetBottom ?? 0),
  );
  const navButton = () => {
    if (hatchingEgg) {
      return { id: "egg" as PageType, icon: Egg, label: "Egg" };
    } else if (currentPixegotchi) {
      return { id: "home" as PageType, icon: Heart, label: "Home" };
    } else {
      return { id: "start" as PageType, icon: Egg, label: "Hatch" };
    }
  };
  return (
    <nav
      style={{
        paddingBottom: `calc(0.375rem + max(0.875rem, ${bottomInset}px, env(safe-area-inset-bottom)))`,
      }}
      className={`${isHidden ? "hidden" : ""} fixed bottom-0 left-0 right-0 z-50 bg-pixel-bg/95 px-2.5 pt-1.5 shadow-[0_-12px_24px_var(--color-pixel-page-shadow-soft)]`}>
      <div className="pixel-panel mx-auto grid max-w-md grid-cols-5 gap-0 overflow-hidden bg-pixel-bg-deep/75 p-0">
        {[
          navButton(),
          { id: "inventory" as PageType, icon: ShoppingBag, label: "Items" },
          { id: "games" as PageType, icon: Gamepad2, label: "Games" },
          { id: "marketplace" as PageType, icon: Store, label: "Market" },
          { id: "vault" as PageType, icon: Vault, label: "Vault" },
          // { id: "loader" as PageType, icon: Vault, label: "Load" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`relative flex min-h-[3.75rem] flex-col items-center justify-center gap-1 border-r-2 border-pixel-border/30 px-1 py-1.5 transition last:border-r-0 max-[380px]:min-h-14 ${
              currentPage === item.id
                ? "bg-pixel-highlight/15 text-pixel-highlight shadow-[inset_0_0_0_2px_var(--color-pixel-inset)]"
                : "theme-readable-muted hover:bg-pixel-surface/40 hover:text-pixel-ink"
            }`}>
            <item.icon
              size={22}
              className={
                currentPage === item.id
                  ? "drop-shadow-[0_2px_0_var(--color-pixel-shadow)]"
                  : ""
              }
            />
            <span className="font-pixel text-[7px] uppercase leading-3">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
