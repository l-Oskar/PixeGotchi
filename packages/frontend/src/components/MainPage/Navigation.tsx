import React, { useEffect, useState } from "react";
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
  useEffect(() => {
    if (isHidden) {
      setIsHiddenState(true);
    } else {
      setIsHiddenState(false);
    }
  }, [currentPage]);

  const [isHiddenState, setIsHiddenState] = useState(false);
  const activePixegotchi = usePixegotchiStore((s) => s.activePixegotchi);
  const hatchingEgg = useEggStore((s) => s.hatchingEgg);
  const navButton = () => {
    if (hatchingEgg) {
      return { id: "egg" as PageType, icon: Egg, label: "Egg" };
    } else if (activePixegotchi) {
      return { id: "home" as PageType, icon: Heart, label: "Home" };
    } else {
      return { id: "start" as PageType, icon: Egg, label: "Hatch" };
    }
  };
  return (
    <nav
      className={`${isHiddenState ? "hidden" : ""} fixed bottom-0 left-0 right-0 pb-1 bg-black/40 backdrop-blur-xl border-t border-white/10`}>
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
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
            className={`flex flex-col items-center gap-1 transition ${
              currentPage === item.id
                ? "text-pink-400"
                : "text-white/60 hover:text-white/90"
            }`}>
            <item.icon size={22} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
