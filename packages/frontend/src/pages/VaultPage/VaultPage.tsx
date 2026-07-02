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
    <div className="space-y-2.5 p-2.5">
      <div className="pixel-panel p-2.5">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <h1 className="font-pixel text-sm leading-5 text-pixel-ink">Vault</h1>
        </div>

        <div className="pixel-panel-soft overflow-hidden border-pink-400/70 bg-linear-to-br from-fuchsia-500/20 via-pixel-surface-soft to-pixel-bg-deep p-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2.5">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <Sparkles className="text-pink-300" size={15} />
                <span className="font-pixel text-[9px] leading-3 text-pixel-ink">
                  Collection Progress
                </span>
              </div>
              <div className="font-pixel text-xl leading-7 text-pixel-ink">
                {collectedCount} / {totalCount}
              </div>
              <div className="pixel-progress mt-1.5 h-2.5">
                <div
                  className="pixel-progress-fill bg-linear-to-r from-pink-500 to-fuchsia-400"
                  style={{ width: `${(collectedCount / totalCount) * 100}%` }}
                />
              </div>
              <div className="mt-2 max-w-48 font-pixel text-[7px] leading-3 text-pixel-muted">
                Collect all elements with level 100 to get Unique rarity.
              </div>
            </div>

            <div className="pixel-panel-soft grid h-16 w-16 place-items-center border-pink-300/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
              <div className="relative grid h-12 w-12 place-items-center">
                <span className="text-3xl leading-none">🏆</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-pixel text-[10px] leading-4 text-pixel-ink">
              Elements Collection
            </h2>
            <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
              Best Pixegotchi by element
            </div>
          </div>
          <div className="pixel-panel-soft px-2 py-1 font-pixel text-[8px] leading-3 text-pixel-highlight">
            {collectedCount}/{totalCount}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {vaultStats.map((item) => (
            <div
              key={item.element}
              className={`pixel-panel-soft relative min-h-36 overflow-hidden p-2 transition max-[380px]:min-h-32 max-[380px]:p-1.5 ${
                item.isEmpty
                  ? "border-dashed bg-pixel-bg-deep/35 opacity-70"
                  : `cursor-pointer bg-linear-to-b from-pixel-surface-soft to-pixel-bg-deep/60 hover:border-pixel-highlight/70 ${RARITY_COLORS[item.bestRarity]?.replace("text", "border") || ""}`
              }`}>
              {!item.isEmpty && item.count > 1 && (
                <div className="absolute right-1.5 top-1.5 rounded-sm border border-pixel-ink/20 bg-pixel-bg-deep/80 px-1.5 py-1 font-pixel text-[7px] leading-3 text-pixel-ink">
                  x{item.count}
                </div>
              )}

              <div className="grid h-20 place-items-center max-[380px]:h-16">
                {item.isEmpty ? (
                  <div className="grid h-16 w-16 place-items-center rounded-sm border border-dashed border-pixel-border/70 bg-pixel-surface/40 max-[380px]:h-14 max-[380px]:w-14">
                    <span className="font-pixel text-lg leading-none text-pixel-muted">
                      ?
                    </span>
                  </div>
                ) : (
                  <img
                    className="pixelated h-24 w-24 object-contain max-[380px]:h-20 max-[380px]:w-20"
                    src={`./${getPixegotchiImg(item)}`}
                    alt={`Pixegotchi-${item.element}`}
                  />
                )}
              </div>

              {!item.isEmpty ? (
                <div className="mt-1">
                  <h3 className="truncate font-pixel text-[9px] leading-3 capitalize text-pixel-ink max-[380px]:text-[8px]">
                    {item.element}
                  </h3>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <div className="font-pixel text-[8px] leading-3 text-pixel-muted">
                      Lv {item.highestLevel}
                    </div>
                    <div
                      className={`rounded-sm border px-1.5 py-1 font-pixel text-[7px] leading-3 max-[380px]:px-1 max-[380px]:py-0.5 ${RARITY_COLORS[item.bestRarity] || "text-pixel-ink"}`}>
                      {item.bestRarity.toUpperCase()}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-center">
                  <h3 className="font-pixel text-[9px] leading-3 text-pixel-muted max-[380px]:text-[8px]">
                    Empty
                  </h3>
                  <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                    Not collected
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {currentPixegotchi && (
          <div className="pixel-panel-soft mt-3 border-pixel-highlight/60 bg-pixel-bg-deep/45 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-pixel text-[10px] leading-4 text-pixel-ink">
                  Add current Pixegotchi
                </div>
                <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                  Send it to the vault collection
                </div>
              </div>
              <SquareArrowRight
                className="shrink-0 text-pixel-highlight"
                size={18}
              />
            </div>
            <button
              className="pixel-button flex w-full min-h-0 items-center justify-center gap-2 px-3 py-3 font-pixel text-[9px] leading-3 hover:scale-105 disabled:hover:scale-100"
              onClick={handleSetToVault}
              disabled={setPixegotchiToVault.isPending}
              type="button">
              <SquareArrowRight size={14} />
              <span>
                {setPixegotchiToVault.isPending
                  ? "Sending..."
                  : "Send to Vault"}
              </span>
            </button>
          </div>
        )}

        {collectedCount === totalCount && (
          <div className="pixel-panel-soft mt-3 overflow-hidden border-pink-400/70 bg-linear-to-r from-pixel-bg-deep via-fuchsia-500/15 to-pixel-bg-deep p-3">
            <div className="flex items-center gap-3">
              <div className="pixel-panel-soft grid h-14 w-14 shrink-0 place-items-center border-pink-300/50 bg-pixel-bg-deep/50 shadow-pixel-inset">
                <span className="text-3xl leading-none">🏆</span>
              </div>
              <div className="min-w-0">
                <div className="font-pixel text-[10px] leading-4 text-pixel-highlight">
                  Complete Collection!
                </div>
                <div className="mt-1 font-pixel text-[8px] leading-4 text-pixel-muted">
                  Level them up to 100 for Unique rarity.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VaultPage;
