import React, { useEffect, useState } from "react";
import { Link } from "@/components/Link/Link.tsx";
import {
  Heart,
  Sparkles,
  ShoppingBag,
  Gamepad2,
  Archive,
  Wallet,
  Coins,
} from "lucide-react";
import type { Pixegotchi, PageType } from "@/pages/MainPage/mainPageTypes";
import VaultPage from "../VaultPage/VaultPage";
import InventoryPage from "../InventoryPage/InventoryPage";
import GamesPage from "../GamePage/GamePage";
import MarketplacePage from "../MarketplacePage/MarketplaceGage";
import { ShowPixeGotchi } from "@/components/PixegotchiPage/ShowPixegotchi";

import { useAuthStore } from "@/store/auth.store";
import { useActivePixegotchi } from "@/services/queries/pixegotchi.queries";

const MainPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { data: pixegotchi } = useActivePixegotchi();

  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [activeTamagotchi, setActivePixegotchi] = useState<Pixegotchi>({
    id: 1,
    userId: 1,
    nftAddress: null,
    genomeHash: "genome",
    element: "air",
    rarity: "rare",
    gender: "male",
    name: "Uni",
    status: "active",
    level: 1,
    experience: 356,
    health: 85,
    hunger: 85,
    energy: 85,
    happiness: 85,
    cleanliness: 85,
    criticalSince: null,
    lastFedAt: null,
    lastPlayedAt: null,
    lastSleptAt: null,
    lastCleanedAt: null,
    lastHealedAt: null,
    lastUpdateAt: null,
    createdAt: null,
  });

  useEffect(() => {
    if (pixegotchi) {
      setActivePixegotchi(pixegotchi);
    }
  }, [pixegotchi]);

  const pages: Record<PageType, React.ReactNode> = {
    home: (
      <ShowPixeGotchi
        tama={activeTamagotchi}
        onNavigate={setCurrentPage}
        setActivePixegotchi={setActivePixegotchi}
      />
    ),
    inventory: <InventoryPage onNavigate={setCurrentPage} />,
    games: <GamesPage onNavigate={setCurrentPage} />,
    marketplace: <MarketplacePage onNavigate={setCurrentPage} />,
    vault: <VaultPage onNavigate={setCurrentPage} />,
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg">
              {user?.username || "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <Coins size={16} className="text-yellow-400" />
              <span className="font-semibold text-sm">
                {user?.pgcBalance || "0"}
              </span>
            </div>
            <Link to="/ton-connect">
              <button className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
                <Wallet size={16} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto pb-20">{pages[currentPage]}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 pb-1 bg-black/40 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
          {[
            { id: "home" as PageType, icon: Heart, label: "Home" },
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
    </div>
  );
};

// PixeGotchi Component

export default MainPage;
