import React from "react";
import { Heart, ShoppingBag, Gamepad2, Vault, Store, Egg } from "lucide-react";
import { PageType } from "@pixegotchi/shared";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { useEggStore } from "@/store/egg.store";

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
      className={`${isHidden ? "hidden" : ""} fixed bottom-0 left-0 right-0 z-50 bg-pixel-bg/95 px-2 pb-1.5 pt-1`}>
      <div className="pixel-panel mx-auto grid max-w-md grid-cols-5 gap-1 p-1">
        {[
          navButton(),
          { id: "inventory" as PageType, icon: ShoppingBag, label: "Items" },
          { id: "games" as PageType, icon: Gamepad2, label: "Games" },
          { id: "marketplace" as PageType, icon: Store, label: "Market" },
          { id: "vault" as PageType, icon: Vault, label: "Vault" },
          // { id: "loader" as PageType, icon: Archive, label: "Load" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-sm border-2 px-1 py-1 transition ${
              currentPage === item.id
                ? "border-pixel-highlight bg-pixel-highlight/15 text-pixel-highlight"
                : "border-transparent text-pixel-muted hover:border-pixel-border hover:text-pixel-ink"
            }`}>
            <item.icon size={18} />
            <span className="font-pixel text-[8px] leading-3">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
