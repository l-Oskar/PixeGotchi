import { useGetAllEggs, useStartHatching } from "@/services/queries/egg.queries";
import { Egg, PageType } from "@pixegotchi/shared";
import React, { useMemo } from "react";
import Loader from "../Other/Loader";
import { Egg as EggIcon, Sparkles } from "lucide-react";

interface StartPageProps {
  onNavigate: (page: PageType) => void;
}

const StartPage: React.FC<StartPageProps> = ({ onNavigate }) => {
  const { data: allEggs, isLoading } = useGetAllEggs();
  const startHatchingEgg = useStartHatching();
  const sortedEggs = useMemo(
    () => [...(allEggs ?? [])].sort((a, b) => a.id - b.id),
    [allEggs],
  );

  if (isLoading || !allEggs) return <Loader title={"Loading eggs..."} />;

  const handleHatch = async (egg: Egg) => {
    try {
      await startHatchingEgg.mutateAsync(egg.id);
      onNavigate("egg");
    } catch (error) {
      console.error("Failed to start hatching:", error);
    }
  };

  if (sortedEggs.length == 0)
    return (
      <div className="p-3 space-y-3">
        <div className="pixel-panel p-3">
          <div className="pixel-panel-soft overflow-hidden border-pixel-highlight/60 bg-linear-to-br from-pixel-highlight/20 via-pixel-surface-soft to-pixel-bg-deep p-4">
            <div className="grid min-h-48 place-items-center gap-3 text-center">
              <div className="pixel-panel-soft grid h-24 w-24 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
                <EggIcon className="text-pixel-highlight" size={46} />
              </div>
              <div>
                <div className="font-pixel text-sm leading-5 text-pixel-ink">
                  No eggs!
                </div>
                <div className="mt-2 font-pixel text-[9px] leading-4 text-pixel-muted">
                  Buy some in the market.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-3 space-y-3">
      <div className="pixel-panel p-3">
        <div className="pixel-panel-soft overflow-hidden border-pixel-highlight/60 bg-linear-to-br from-pixel-highlight/20 via-pixel-surface-soft to-pixel-bg-deep p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="text-pixel-highlight" size={16} />
                <span className="font-pixel text-[10px] leading-4 text-pixel-ink">
                  Hatchery
                </span>
              </div>
              <div className="font-pixel text-2xl leading-8 text-pixel-ink">
                {sortedEggs.length} {sortedEggs.length > 1 ? "eggs" : "egg"}
              </div>
              <div className="mt-2 font-pixel text-[8px] leading-4 text-pixel-muted">
                Choose an egg to start hatching.
              </div>
            </div>
            <div className="pixel-panel-soft grid h-20 w-20 shrink-0 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
              <EggIcon className="text-pixel-highlight" size={40} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <h2 className="font-pixel text-[11px] leading-4 text-pixel-ink">
              Available Eggs
            </h2>
            <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
              Start hatching one egg
            </div>
          </div>
          <div className="pixel-panel-soft px-2 py-1 font-pixel text-[8px] leading-3 text-pixel-highlight">
            {sortedEggs.length}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2">
          {sortedEggs.map((egg) => (
            <div
              className="pixel-panel-soft flex min-h-36 flex-col overflow-hidden bg-linear-to-b from-pixel-surface-soft to-pixel-bg-deep/60 p-2"
              key={egg.id}>
              <div className="grid h-20 place-items-center">
                <div className="pixel-icon-box h-16 w-16 text-pixel-highlight">
                  <EggIcon size={34} />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-pixel text-[10px] leading-4 text-pixel-ink">
                  Egg-#{egg.id}
                </div>
                <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                  Ready to hatch
                </div>
              </div>
              {/* <span>Is listed: {egg.isListed ? "Yes" : "No"} </span> */}
              <button
                className="pixel-button mt-2 min-h-0 w-full px-3 py-2 font-pixel text-[8px] leading-3 hover:scale-105 disabled:cursor-wait disabled:opacity-70 disabled:hover:scale-100"
                type="button"
                disabled={startHatchingEgg.isPending}
                onClick={() => handleHatch(egg)}>
                {startHatchingEgg.isPending ? "HATCHING..." : "HATCH"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartPage;
