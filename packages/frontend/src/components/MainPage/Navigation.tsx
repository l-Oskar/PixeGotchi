import React from "react";
import {
  Heart,
  ShoppingBag,
  Gamepad2,
  Archive,
  Coins,
  Egg,
} from "lucide-react";
import { PageType } from "@shared";
import { usePixegotchiStore } from "@/store/pixegotchi.store";

export interface NavigationProps {
  currentPage: PageType;
  setCurrentPage: (currentPage: PageType) => void;
}

const Navigation: React.FC<NavigationProps> = ({
  currentPage,
  setCurrentPage,
}) => {
  const activePixegotchi = usePixegotchiStore((s) => s.activePixegotchi);
  return (
    <nav className="fixed bottom-0 left-0 right-0 pb-1 bg-black/40 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
        {[
          {
            id: !activePixegotchi ? ("egg" as PageType) : ("home" as PageType),
            icon: !activePixegotchi ? Egg : Heart,
            label: !activePixegotchi ? "Egg" : "Home",
          },
          { id: "inventory" as PageType, icon: ShoppingBag, label: "Bag" },
          { id: "games" as PageType, icon: Gamepad2, label: "Games" },
          { id: "marketplace" as PageType, icon: Coins, label: "Market" },
          { id: "vault" as PageType, icon: Archive, label: "Vault" },
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
