import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type PageType } from "@pixegotchi/shared";
import VaultPage from "../VaultPage/VaultPage";
import InventoryPage from "../InventoryPage/InventoryPage";
import GamesPage from "../GamePage/GamePage";
import MarketplacePage from "../MarketplacePage/MarketplacePage";
import Header from "@/components/MainPage/layout/Header";
import Navigation from "@/components/MainPage/layout/Navigation";
import { ShowPixeGotchi } from "@/components/PixegotchiPage/ShowPixegotchi";
import { useUserStore } from "@/store/user.store";
import EggComponent from "@/components/EggComponent/EggComponent";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import Empty from "@/components/MainPage/start/StartPage";
import { useEggStore } from "@/store/egg.store";
import Loader from "@/components/Other/Loader";
import PixegothiData from "@/components/PixegotchiPage/PixegothiData";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";
import { useRoomEditorStore } from "@/store/room-editor.store";

const MainPage: React.FC = () => {
  const user = useUserStore((s) => s.user);
  const egg = useEggStore((s) => s.hatchingEgg);
  const pixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);
  const isRoomEditing = useRoomEditorStore((state) => state.isEditing);
  const safeAreaInsetBottom = useSignal(viewport.safeAreaInsetBottom);
  const contentSafeAreaInsetBottom = useSignal(
    viewport.contentSafeAreaInsetBottom,
  );
  const bottomInset = Math.max(
    0,
    (safeAreaInsetBottom ?? 0) + (contentSafeAreaInsetBottom ?? 0),
  );

  const [currentPage, setCurrentPage] = useState<PageType>("start");
  const [sortParam, setSortParam] = useState<string | undefined>(undefined);
  const [isGameActive, setIsGameActive] = useState(false);

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
      <ShowPixeGotchi pixegotchi={pixegotchi} onNavigate={handleNavigate} />
    ) : null,
    egg: egg ? <EggComponent onNavigate={handleNavigate} /> : null,
    inventory: (
      <InventoryPage onNavigate={handleNavigate} initialSort={sortParam} />
    ),
    games: (
      <GamesPage
        onNavigate={handleNavigate}
        onGameActiveChange={setIsGameActive}
        pixegotchi={pixegotchi}
      />
    ),
    marketplace: <MarketplacePage onNavigate={handleNavigate} />,
    vault: <VaultPage onNavigate={handleNavigate} />,
  };
  const renderedPage = pages[resolvedPage] ?? pages[derivedPage] ?? pages.start;
  const isImmersiveMode = isGameActive || isRoomEditing;
  const previousPageRef = useRef<PageType>(resolvedPage);

  useLayoutEffect(() => {
    if (previousPageRef.current === resolvedPage) {
      return;
    }

    previousPageRef.current = resolvedPage;
    window.scrollTo(0, 0);

    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }

    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [resolvedPage]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--color-pixel-bg)_0%,var(--color-pixel-bg-deep)_100%)] text-pixel-ink">
      {!isImmersiveMode && <Header user={user} />}
      {/* Content */}
      <main
        className="mx-auto max-w-md"
        style={{
          paddingBottom: isRoomEditing
            ? 0
            : `calc(6rem + max(${bottomInset}px, env(safe-area-inset-bottom)))`,
        }}>
        {renderedPage}
      </main>
      {/* Bottom Navigation */}
      <Navigation
        currentPage={resolvedPage}
        isHidden={isImmersiveMode}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
};

export default MainPage;
