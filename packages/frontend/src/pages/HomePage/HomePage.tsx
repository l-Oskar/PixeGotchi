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

const TamagotchiUISketch = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [activeTamagotchi, setActiveTamagotchi] = useState({
    name: "Pyro",
    level: 15,
    element: "fire",
    rarity: "legendary",
    health: 85,
    hunger: 40,
    energy: 60,
    happiness: 75,
    cleanliness: 90,
    experience: 750,
    nextLevelExp: 1000,
  });

  const pages = {
    home: <HomePage tama={activeTamagotchi} onNavigate={setCurrentPage} />,
    inventory: <InventoryPage onNavigate={setCurrentPage} />,
    games: <GamesPage onNavigate={setCurrentPage} />,
    marketplace: <MarketplacePage onNavigate={setCurrentPage} />,
    vault: <VaultPage onNavigate={setCurrentPage} />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <span className="font-bold text-lg">PixeGotchi</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <Coins size={16} className="text-yellow-400" />
              <span className="font-semibold text-sm">1,250</span>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-around">
          {[
            { id: "home", icon: Heart, label: "Home" },
            { id: "inventory", icon: ShoppingBag, label: "Bag" },
            { id: "games", icon: Gamepad2, label: "Games" },
            { id: "marketplace", icon: Coins, label: "Market" },
            { id: "vault", icon: Archive, label: "Vault" },
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

// HomePage Component
const HomePage = ({ tama, onNavigate }) => {
  const [cooldowns, setCooldowns] = useState({
    feed: false,
    play: false,
    sleep: false,
    clean: false,
    heal: false,
  });

  const handleAction = (action) => {
    setCooldowns((prev) => ({ ...prev, [action]: true }));
    setTimeout(() => {
      setCooldowns((prev) => ({ ...prev, [action]: false }));
    }, 3000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tamagotchi Card */}
      <div className="bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {tama.name}
              <span className="text-lg">🔥</span>
            </h2>
            <button className="text-white/60 hover:text-white">
              <Menu size={20} />
            </button>
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
                  {tama.experience} / {tama.nextLevelExp}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(tama.experience / tama.nextLevelExp) * 100}%`,
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
        <div className="relative bg-gradient-to-b from-blue-500/10 to-purple-500/10 rounded-2xl h-56 flex items-center justify-center border border-white/5">
          <div className="text-9xl animate-bounce">🐲</div>
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

// InventoryPage Component
const InventoryPage = ({ onNavigate }) => {
  const items = [
    { id: 1, name: "Apple", type: "food", quantity: 15, icon: "🍎" },
    { id: 2, name: "Health Potion", type: "medicine", quantity: 3, icon: "💊" },
    { id: 3, name: "Gold Chest", type: "chest", quantity: 2, icon: "📦" },
    { id: 4, name: "Candy", type: "food", quantity: 8, icon: "🍬" },
    { id: 5, name: "Energy Drink", type: "special", quantity: 5, icon: "⚡" },
    { id: 6, name: "Rename Tag", type: "special", quantity: 1, icon: "🏷️" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Inventory</h1>

      <div className="grid grid-cols-3 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition flex flex-col items-center gap-2 group">
            <div className="text-4xl group-hover:scale-110 transition">
              {item.icon}
            </div>
            <div className="text-xs font-medium text-center">{item.name}</div>
            <div className="text-xs text-white/60">×{item.quantity}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// GamesPage Component
const GamesPage = ({ onNavigate }) => {
  const games = [
    {
      id: 1,
      name: "Memory Match",
      difficulty: "Easy",
      reward: "50-100",
      icon: "🧠",
    },
    {
      id: 2,
      name: "Quick Tap",
      difficulty: "Medium",
      reward: "100-200",
      icon: "⚡",
    },
    {
      id: 3,
      name: "Puzzle Solver",
      difficulty: "Hard",
      reward: "200-500",
      icon: "🧩",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Mini Games</h1>

      <div className="space-y-3">
        {games.map((game) => (
          <button
            key={game.id}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl p-4 border border-white/10 transition flex items-center gap-4">
            <div className="text-5xl">{game.icon}</div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">{game.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                  {game.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded-full text-yellow-400">
                  {game.reward} TMC
                </span>
              </div>
            </div>
            <div className="text-white/40">▶</div>
          </button>
        ))}
      </div>
    </div>
  );
};

// MarketplacePage Component
const MarketplacePage = ({ onNavigate }) => {
  const listings = [
    {
      id: 1,
      item: "Fire Egg",
      price: 500,
      currency: "TMC",
      seller: "User#123",
      icon: "🥚",
    },
    {
      id: 2,
      item: "Legendary Chest",
      price: 2,
      currency: "TON",
      seller: "User#456",
      icon: "📦",
    },
    {
      id: 3,
      item: "Health Pack x10",
      price: 150,
      currency: "TMC",
      seller: "User#789",
      icon: "💊",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Marketplace</h1>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{listing.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold">{listing.item}</h3>
                <div className="text-xs text-white/60">by {listing.seller}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-yellow-400">
                  {listing.price} {listing.currency}
                </div>
                <button className="mt-2 px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium hover:scale-105 transition">
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// VaultPage Component
const VaultPage = ({ onNavigate }) => {
  const vaultItems = [
    { id: 1, name: "Aqua", level: 10, element: "water", icon: "🐟" },
    { id: 2, name: "Terra", level: 20, element: "earth", icon: "🦖" },
    { id: 3, name: "Zephyr", level: 10, element: "air", icon: "🦅" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Vault Collection</h1>

      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-yellow-400" size={20} />
          <span className="font-semibold">Collection Progress</span>
        </div>
        <div className="text-2xl font-bold">3 / 10</div>
        <div className="text-xs text-white/60 mt-1">
          Collect all level 100 to unlock Legendary!
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {vaultItems.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 rounded-2xl p-4 border border-white/10">
            <div className="text-5xl mb-2">{item.icon}</div>
            <h3 className="font-semibold">{item.name}</h3>
            <div className="text-xs text-white/60 mt-1">Level {item.level}</div>
          </div>
        ))}

        {[...Array(7)].map((_, i) => (
          <div
            key={`empty-${i}`}
            className="bg-white/5 rounded-2xl p-4 border border-white/10 border-dashed opacity-50">
            <div className="text-5xl mb-2">❓</div>
            <div className="text-xs text-white/60">Empty Slot</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper Components
const CompactStat = ({ icon: Icon, value, bgColor, strokeColor }) => {
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${strokeColor} transition-all duration-500`}
          />
        </svg>
        {/* Icon in center */}
        <div
          className={`absolute inset-0 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon size={16} className={strokeColor} />
        </div>
      </div>
      <div className="text-[10px] font-semibold text-white/80">{value}%</div>
    </div>
  );
};

const StatBar = ({ icon: Icon, label, value, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-1">
      <div className="flex items-center gap-1.5">
        <Icon size={14} className={color} />
        <span className="text-white/80">{label}</span>
      </div>
      <span className="text-white/60">{value}%</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${
          value > 70
            ? "from-green-500 to-emerald-500"
            : value > 40
              ? "from-yellow-500 to-orange-500"
              : "from-red-500 to-pink-500"
        } rounded-full transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick, disabled, gradient }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`bg-gradient-to-br ${gradient} hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl p-4 transition flex flex-col items-center gap-2 shadow-lg`}>
    <Icon size={24} />
    <span className="text-xs font-semibold">{label}</span>
    {disabled && <span className="text-[10px] text-white/60">Cooldown...</span>}
  </button>
);

export default TamagotchiUISketch;
