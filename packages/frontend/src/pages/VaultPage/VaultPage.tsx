import { Sparkles, SquareArrowRight } from "lucide-react";
import { PageType, RARITY_COLORS } from "@pixegotchi/shared";
import Loader from "@/components/Other/Loader";
import { useStatsVault } from "@/services/queries/vault.queries";
import { getPixegotchiImg } from "@/utils/getImage";
import { usePixegotchiToVault } from "@/services/queries/pixegotchi.queries";
import { usePixegotchiStore } from "@/store/pixegotchi.store";

interface VaultPageProps {
  onNavigate: (page: PageType) => void;
}

const VaultPage: React.FC<VaultPageProps> = ({ onNavigate }) => {
  const { isLoading, data } = useStatsVault();
  const vaultStats = data ?? [];
  const setPixegotchiToVault = usePixegotchiToVault();
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);

  const handleSetToVault = async () => {
    try {
      await setPixegotchiToVault.mutateAsync();
      onNavigate("start");
    } catch (error) {
      console.error("Failed to send Pixegotchi to vault:", error);
    }
  };

  const collectedCount = vaultStats
    ? vaultStats.filter((stat) => !stat.isEmpty).length
    : 0;
  const totalCount = 14;

  if (isLoading) {
    return <Loader title={"Loading vault..."} />;
  }

  return (
    <div className="space-y-3 p-3">
      <div className="pixel-panel p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">
            Vault
          </h1>
          {currentPixegotchi && (
            <button
              className="pixel-button flex min-h-0 items-center gap-1.5 px-3 py-2 font-pixel text-[8px] leading-3 hover:scale-105 disabled:hover:scale-100"
              onClick={handleSetToVault}
              disabled={setPixegotchiToVault.isPending}
              type="button">
              <SquareArrowRight size={14} />
              <span>Send</span>
            </button>
          )}
        </div>

        <div className="pixel-panel-soft p-3">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="text-pixel-highlight" size={16} />
            <span className="font-pixel text-[10px] leading-4 text-pixel-ink">
              Collection Progress
            </span>
          </div>
          <div className="font-pixel text-sm leading-5 text-pixel-highlight">
            {collectedCount} / {totalCount}
          </div>
          <div className="pixel-progress mt-2">
            <div
              className="pixel-progress-fill"
              style={{ width: `${(collectedCount / totalCount) * 100}%` }}
            />
          </div>
          <div className="mt-2 font-pixel text-[8px] leading-4 text-pixel-muted">
            Collect all elements with level 100 to get Unique rarity.
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          {vaultStats.map((item) => (
            <div
              key={item.element}
              className={`pixel-panel-soft min-h-36 p-2 transition ${
                item.isEmpty
                  ? "border-dashed opacity-60"
                  : `cursor-pointer hover:border-pixel-highlight/70 ${RARITY_COLORS[item.bestRarity]?.replace("text", "border") || ""}`
              }`}>
              <div className="grid h-20 place-items-center">
                {item.isEmpty ? (
                  <span className="font-pixel text-lg leading-none text-pixel-muted">
                    ?
                  </span>
                ) : (
                  <img
                    className="pixelated h-24 w-24 object-contain"
                    src={`./${getPixegotchiImg(item)}`}
                    alt={`Pixegotchi-${item.element}`}
                  />
                )}
              </div>
              <h3 className="truncate font-pixel text-[9px] leading-4 capitalize text-pixel-ink">
                {!item.isEmpty ? item.element : "Empty"}
                {!item.isEmpty && item.count > 1 && (
                  <span className="ml-1 text-pixel-muted">x{item.count}</span>
                )}
              </h3>

              {!item.isEmpty ? (
                <>
                  <div className="font-pixel text-[8px] leading-3 text-pixel-muted">
                    Level {item.highestLevel}
                  </div>
                  <div
                    className={`mt-1 w-max rounded-sm border px-1.5 py-1 font-pixel text-[7px] leading-3 ${RARITY_COLORS[item.bestRarity] || "text-pixel-ink"}`}>
                    {item.bestRarity.toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="mt-1 font-pixel text-[8px] leading-3 text-pixel-muted">
                  Not collected
                </div>
              )}
            </div>
          ))}
        </div>

        {collectedCount === totalCount && (
          <div className="pixel-panel-soft mt-3 p-3 text-center">
            <div className="mb-2 text-xl">🏆</div>
            <div className="font-pixel text-[10px] leading-4 text-pixel-highlight">
              Complete Collection!
            </div>
            <div className="mt-1 font-pixel text-[8px] leading-4 text-pixel-muted">
              Level them up to 100 for Unique rarity.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultPage;
