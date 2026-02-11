import React, { useState } from "react";
import { Link } from "@/components/Link/Link.tsx";
import {
  Heart,
  Sparkles,
  ShoppingBag,
  Gamepad2,
  Archive,
  Moon,
  Apple,
  Pill,
  Trash2,
  Zap,
  Smile,
  Droplets,
  Menu,
  Wallet,
  Coins,
} from "lucide-react";
import type {
  Pixegotchi,
  PageType,
  Cooldowns,
  HomePageProps,
} from "@/pages/MainPage/mainPageTypes";
import VaultPage from "../VaultPage/VaultPage";
import InventoryPage from "../InventoryPage/InventoryPage";
import GamesPage from "../GamePage/GamePage";
import MarketplacePage from "../MarketplacePage/MarketplaceGage";
import CompactStat from "@/components/MainPage/CompactStat";
import ActionButton from "@/components/MainPage/ActionButton";

import { useTonWallet } from "@tonconnect/ui-react";

const MainPage: React.FC = () => {
  const wallet = useTonWallet();
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

  const pages: Record<PageType, React.ReactNode> = {
    home: (
      <PixeGotchiPage
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
            <span className="font-bold text-lg">PixeGotchi</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <Coins size={16} className="text-yellow-400" />
              {!wallet ? (
                <>0</>
              ) : (
                <span className="font-semibold text-sm">1,250</span>
              )}
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
const PixeGotchiPage: React.FC<HomePageProps> = ({
  tama,
  onNavigate,
  setActivePixegotchi,
}) => {
  const [cooldowns, setCooldowns] = useState<Cooldowns>({
    feed: false,
    play: false,
    sleep: false,
    clean: false,
    heal: false,
  });

  const handleAction = (action: keyof Cooldowns) => {
    setCooldowns((prev) => ({ ...prev, [action]: true }));
    setTimeout(() => {
      setCooldowns((prev) => ({ ...prev, [action]: false }));
    }, 3000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tamagotchi Card */}
      <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {tama.name}
              <span className="text-lg">🌈</span>
            </h2>
            <Link to="/index">
              <button
                onClick={() => setActivePixegotchi(tama)}
                className="text-white/60 hover:text-white">
                <Menu size={20} />
              </button>
            </Link>
          </div>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-orange-500/30 rounded-full border border-orange-400/50 capitalize">
                {tama.rarity}
              </span>
              <span className="text-xs px-2 py-0.5 bg-purple-500/30 rounded-full border border-purple-400/50">
                Lvl {tama.level}
              </span>
            </div>

            {/* Compact Experience Bar */}
            <div className="mb-1 flex-1 min-w-0">
              <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                <span>EXP</span>
                <span>
                  {tama.experience} / {1000}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(tama.experience / (1000 - tama.experience)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <CompactStat
            icon={Heart}
            value={tama.health}
            bgColor="bg-red-500/20"
            strokeColor="text-red-500"
          />
          <CompactStat
            icon={Apple}
            value={100 - tama.hunger}
            bgColor="bg-orange-500/20"
            strokeColor="text-orange-500"
          />
          <CompactStat
            icon={Zap}
            value={tama.energy}
            bgColor="bg-yellow-500/20"
            strokeColor="text-yellow-500"
          />
          <CompactStat
            icon={Smile}
            value={tama.happiness}
            bgColor="bg-pink-500/20"
            strokeColor="text-pink-500"
          />
          <CompactStat
            icon={Droplets}
            value={tama.cleanliness}
            bgColor="bg-blue-500/20"
            strokeColor="text-blue-500"
          />
        </div>

        {/* Tamagotchi Visual */}
        <div className="relative bg-linear-to-b from-blue-500/10 to-purple-500/10 rounded-2xl h-56 flex items-center justify-center border border-white/5">
          <div className="text-9xl animate-bounce">🦄</div>
          <div className="absolute top-3 right-3 flex gap-1">
            {[...Array(tama.level >= 10 ? 1 : 2)].map((_, i) => (
              <Heart key={i} size={18} className="text-red-500 fill-red-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <ActionButton
          icon={Apple}
          label="Feed"
          onClick={() => handleAction("feed")}
          disabled={cooldowns.feed}
          gradient="from-orange-500 to-red-500"
        />
        <ActionButton
          icon={Gamepad2}
          label="Play"
          onClick={() => handleAction("play")}
          disabled={cooldowns.play}
          gradient="from-purple-500 to-pink-500"
        />
        <ActionButton
          icon={Moon}
          label="Sleep"
          onClick={() => handleAction("sleep")}
          disabled={cooldowns.sleep}
          gradient="from-blue-500 to-indigo-500"
        />
        <ActionButton
          icon={Pill}
          label="Heal"
          onClick={() => handleAction("heal")}
          disabled={cooldowns.heal}
          gradient="from-green-500 to-emerald-500"
        />
        <ActionButton
          icon={Trash2}
          label="Clean"
          onClick={() => handleAction("clean")}
          disabled={cooldowns.clean}
          gradient="from-cyan-500 to-blue-500"
        />
        <ActionButton
          icon={ShoppingBag}
          label="Items"
          onClick={() => onNavigate("inventory")}
          gradient="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h3 className="text-sm font-semibold mb-3 text-white/80">Quick Info</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              🎮
            </div>
            <div>
              <div className="text-white/60 text-xs">Games Played</div>
              <div className="font-semibold">47</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              ⏱️
            </div>
            <div>
              <div className="text-white/60 text-xs">Age</div>
              <div className="font-semibold">12 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
