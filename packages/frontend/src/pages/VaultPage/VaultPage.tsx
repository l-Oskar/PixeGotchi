import { Sparkles } from "lucide-react";
import { PageType } from "@shared";
import { useAllVault } from "@/services/queries/vault.queries";
import { useVaultStore } from "@/store/vault.store";
import { getPixegotchiImg } from "@/utils/getImage";
import { useEffect, useState } from "react";

interface VaultPageProps {
  onNavigate?: (page: PageType) => void;
}

// Кольори для рідкості
const RARITY_COLORS: Record<string, string> = {
  common: "text-gray-400",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  mythic: "text-pink-400",
  legendary: "text-yellow-400",
  unique: "text-orange-400",
};

const VaultPage: React.FC<VaultPageProps> = () => {
  const { isLoading, data } = useAllVault();
  const allVault = useVaultStore((s) => s.allVault);
  const [vaultStats, setVaultStats] = useState<any[]>([]);

  useEffect(() => {
    if (data) {
      setVaultStats(data);
    } else if (allVault) {
      setVaultStats(allVault);
    }
  }, [data, allVault]);

  const collectedCount = vaultStats
    ? vaultStats.filter((stat) => !stat.isEmpty).length
    : 0;
  const totalCount = 14;

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Vault Collection</h1>
        <div className="flex justify-center items-center h-64">
          <div className="text-white/60">Loading vault...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Vault Collection</h1>

      {/* Прогрес колекції */}
      <div className="bg-linear-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-yellow-400" size={20} />
          <span className="font-semibold">Collection Progress</span>
        </div>
        <div className="text-2xl font-bold">
          {collectedCount} / {totalCount}
        </div>
        <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400"
            style={{ width: `${(collectedCount / totalCount) * 100}%` }}
          />
        </div>
        <div className="text-xs text-white/60 mt-1">
          Collect all elements with level 100 to get Unique rarity!
        </div>
      </div>

      {/* Сітка елементів */}
      <div className="grid grid-cols-2 gap-3">
        {vaultStats.map((item) => (
          <div
            key={item.element}
            className={`
              rounded-2xl p-4 border transition-all
              ${
                item.isEmpty
                  ? "bg-white/5 border-white/10 border-dashed opacity-50"
                  : `bg-white/10 border-white/20 hover:scale-105 cursor-pointer
                   ${RARITY_COLORS[item.bestRarity]?.replace("text", "border") || "border-white/20"}`
              }
            `}>
            <div className="text-5xl">
              {item.isEmpty ? (
                "❓"
              ) : (
                <img
                  className="w-40 h-40 -my-6"
                  src={`./${getPixegotchiImg(item)}`}
                  alt={`Pixegotchi-${item.element}`}
                />
              )}
            </div>
            <h3 className="font-semibold capitalize">
              {item.element}
              {!item.isEmpty && item.count > 1 && (
                <span className="ml-1 text-base text-white/40">
                  x{item.count}
                </span>
              )}
            </h3>

            {!item.isEmpty ? (
              <>
                <div className="text-xs text-white/60">
                  Level {item.highestLevel}
                </div>
                <div
                  className={`w-max px-2 text-xs font-semibold mt-1 border rounded-xl text-center ${RARITY_COLORS[item.bestRarity] || "text-white"}`}>
                  {item.bestRarity.toUpperCase()}
                </div>
              </>
            ) : (
              <div className="text-xs text-white/40 mt-1">Not collected</div>
            )}
          </div>
        ))}
      </div>

      {/* Повідомлення про завершення колекції */}
      {collectedCount === totalCount && (
        <div className="mt-4 p-4 bg-yellow-500/20 rounded-2xl border border-yellow-500/30 text-center">
          <div className="text-2xl mb-2">🏆</div>
          <div className="font-bold">Complete Collection!</div>
          <div className="text-xs text-white/60 mt-1">
            You've collected all elements! Now level them up to 100 for Unique
            rarity.
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultPage;
