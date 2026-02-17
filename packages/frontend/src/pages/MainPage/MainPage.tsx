import React, { useEffect, useState } from "react";
import type { Pixegotchi, PageType } from "@/pages/MainPage/mainPageTypes";
import VaultPage from "../VaultPage/VaultPage";
import InventoryPage from "../InventoryPage/InventoryPage";
import GamesPage from "../GamePage/GamePage";
import MarketplacePage from "../MarketplacePage/MarketplaceGage";
import Header from "@/components/MainPage/Header";
import Navigation from "@/components/MainPage/Navigation";
import { ShowPixeGotchi } from "@/components/PixegotchiPage/ShowPixegotchi";

import { useAuthStore } from "@/store/auth.store";
import { useActivePixegotchi } from "@/services/queries/pixegotchi.queries";
import EggComponents from "@/components/EggComponent/EggComponents";
import { pixe } from "./fakeData";

const MainPage: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const { data: pixegotchi } = useActivePixegotchi();

  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const [activePixegotchi, setActivePixegotchi] = useState<Pixegotchi>(pixe);

  useEffect(() => {
    if (pixegotchi) {
      setActivePixegotchi(pixegotchi);
    }
  }, [pixegotchi]);

  const pages: Record<PageType, React.ReactNode> = {
    home: (
      <ShowPixeGotchi tama={activePixegotchi} onNavigate={setCurrentPage} />
    ),
    egg: <EggComponents onNavigate={setCurrentPage} />,
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
