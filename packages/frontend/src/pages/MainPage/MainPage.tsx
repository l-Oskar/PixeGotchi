import React, { useMemo, useState, useEffect } from "react";
import { type PageType } from "@pixegotchi/shared";
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
import Loader from "@/components/Other/Loader";
import PixegothiData from "@/components/PixegotchiPage/PixegothiData";

const MainPage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const egg = useEggStore((s) => s.hatchingEgg);
  const pixegotchi = usePixegotchiStore((s) => s.activePixegotchi);

  const [currentPage, setCurrentPage] = useState<PageType>("start");
  const [sortParam, setSortParam] = useState<string | undefined>(undefined);

  const handleNavigate = (page: PageType, sortBy?: string) => {
    setCurrentPage(page);
    if (page !== "inventory") {
      setSortParam(undefined);
    } else {
      setSortParam(sortBy);
    }
  };

  useEffect(() => {
    if (currentPage === "inventory") {
      setSortParam(undefined);
    }
  }, [currentPage]);

  // Derive currentPage based on state (no circular deps)
  const derivedPage = useMemo<PageType>(() => {
    if (pixegotchi) return "home";
    if (egg) return "egg";
    return "start";
  }, [pixegotchi, egg]);

  // Use derived page for rendering, but allow manual override via setCurrentPage
  const resolvedPage = useMemo<PageType>(() => {
    if (currentPage === "start" && derivedPage !== "start") {
      return derivedPage;
    }

    if ((currentPage === "home" || currentPage === "data") && !pixegotchi) {
      return derivedPage;
    }

    if (currentPage === "egg" && !egg) {
      return derivedPage;
    }

    return currentPage;
  }, [currentPage, derivedPage, pixegotchi, egg]);

  const pages: Record<PageType, React.ReactNode> = {
    data: <PixegothiData pixegotchi={pixegotchi} />,
    loader: <Loader />,
    start: <Empty onNavigate={handleNavigate} />,
    home: pixegotchi ? (
      <ShowPixeGotchi
        pixegotchi={pixegotchi}
        onNavigate={handleNavigate}
      />
    ) : null,
    egg: egg ? (
      <EggComponent
        onNavigate={handleNavigate}
      />
    ) : null,
    inventory: (
      <InventoryPage onNavigate={handleNavigate} initialSort={sortParam} />
    ),
    games: <GamesPage onNavigate={handleNavigate} pixegotchi={pixegotchi} />,
    marketplace: <MarketplacePage onNavigate={handleNavigate} />,
    vault: (
      <VaultPage onNavigate={handleNavigate} />
    ),
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <Header user={user} />
      {/* Content */}
      <main className="max-w-md mx-auto pb-20">{pages[resolvedPage]}</main>
      {/* Bottom Navigation */}
      <Navigation currentPage={resolvedPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default MainPage;
