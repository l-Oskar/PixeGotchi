import React, { useEffect, useState } from "react";
import { type Pixegotchi, type PageType, Egg } from "@shared";
import VaultPage from "../VaultPage/VaultPage";
import InventoryPage from "../InventoryPage/InventoryPage";
import GamesPage from "../GamePage/GamePage";
import MarketplacePage from "../MarketplacePage/MarketplacePage";
import Header from "@/components/MainPage/Header";
import Navigation from "@/components/MainPage/Navigation";
import { ShowPixeGotchi } from "@/components/PixegotchiPage/ShowPixegotchi";
import { useAuthStore } from "@/store/auth.store";
import EggComponent from "@/components/EggComponent/EggComponent";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { useEggStore } from "@/store/egg.store";

const MainPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const pixegotchi = usePixegotchiStore((s) => s.activePixegotchi);
  const egg = useEggStore((s) => s.hatchingEgg);

  const [currentPage, setCurrentPage] = useState<PageType>("egg" as PageType);
  const [activePixegotchi, setActivePixegotchi] = useState<Pixegotchi | null>(
    null,
  );
  const [hatchingEgg, setHatchingEgg] = useState<Egg | null>(null);

  useEffect(() => {
    if (pixegotchi) {
      setActivePixegotchi(pixegotchi);
    }
    if (egg) {
      setHatchingEgg(egg!);
    }
  }, [pixegotchi, egg]);

  useEffect(() => {
    if (activePixegotchi) {
      setCurrentPage("home" as PageType);
    } else {
      setCurrentPage("egg" as PageType);
    }
  }, [activePixegotchi]);

  const pages: Record<PageType, React.ReactNode> = {
    home: (
      <ShowPixeGotchi tama={activePixegotchi} onNavigate={setCurrentPage} />
    ),
    egg: <EggComponent egg={hatchingEgg} onNavigate={setCurrentPage} />,
    inventory: <InventoryPage onNavigate={setCurrentPage} />,
    games: <GamesPage onNavigate={setCurrentPage} />,
    marketplace: <MarketplacePage onNavigate={setCurrentPage} />,
    vault: <VaultPage onNavigate={setCurrentPage} />,
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <Header user={user} />
      {/* Content */}
      <main className="max-w-md mx-auto pb-20">{pages[currentPage]}</main>
      {/* Bottom Navigation */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default MainPage;
