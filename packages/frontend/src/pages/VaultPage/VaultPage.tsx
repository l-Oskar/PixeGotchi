import { Sparkles } from "lucide-react";
import { PageType, ElementType } from "../MainPage/mainPageTypes";

interface VaultPageProps {
  onNavigate?: (page: PageType) => void;
}

interface VaultItem {
  id: number;
  name: string;
  level: number;
  element: ElementType;
  icon: string;
}

// VaultPage
const VaultPage: React.FC<VaultPageProps> = () => {
  const vaultItems: VaultItem[] = [
    { id: 1, name: "Aqua", level: 10, element: "water", icon: "🐟" },
    { id: 2, name: "Terra", level: 20, element: "earth", icon: "🦖" },
    { id: 3, name: "Zephyr", level: 10, element: "air", icon: "🦅" },
  ];

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Vault Collection</h1>

      <div className="bg-linear-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30">
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

export default VaultPage;
