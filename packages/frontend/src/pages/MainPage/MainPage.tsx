import React, { useEffect, useState } from "react";
import { type Pixegotchi, type PageType, Egg } from "@shared";
import VaultPage from "../VaultPage/VaultPage";
import InventoryPage from "../InventoryPage/InventoryPage";
import GamesPage from "../GamePage/GamePage";
import MarketplacePage from "../MarketplacePage/MarketplacePage";
import Header from "@/components/MainPage/Header";
import Navigation from "@/components/MainPage/Navigation";
import { ShowPixeGotchi } from "@/components/PixegotchiPage/ShowPixegotchi";
import { useUserStore } from "@/store/user.store";
import EggComponent from "@/components/EggComponent/EggComponent";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import Empty from "@/components/MainPage/StartPage";
import { useEggStore } from "@/store/egg.store";

const MainPage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const egg = useEggStore((s) => s.hatchingEgg);
  const pixegotchi = usePixegotchiStore((s) => s.activePixegotchi);

  const [currentPage, setCurrentPage] = useState<PageType>("start");
  const [activePixegotchi, setActivePixegotchi] = useState<Pixegotchi | null>(
    null,
  );

  useEffect(() => {
    if (pixegotchi) {
      setActivePixegotchi(pixegotchi);
    }
  }, [pixegotchi]);

  useEffect(() => {
    if (activePixegotchi) {
      setCurrentPage("home");
    } else if (egg) {
      setCurrentPage("egg");
    } else {
      setCurrentPage("start");
    }
  }, [activePixegotchi, egg]);

  const pages: Record<PageType, React.ReactNode> = {
    start: <Empty />,
    home: activePixegotchi ? (
      <ShowPixeGotchi tama={activePixegotchi} onNavigate={setCurrentPage} />
    ) : null,
    egg: egg ? <EggComponent onNavigate={setCurrentPage} /> : null,
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
