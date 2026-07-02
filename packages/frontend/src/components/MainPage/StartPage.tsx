import { useGetAllEggs, useStartHatching } from "@/services/queries/egg.queries";
import { Egg, PageType } from "@pixegotchi/shared";
import React, { useMemo } from "react";
import Loader from "../Other/Loader";

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
        <div className="pixel-panel p-4">
          <div className="grid min-h-48 place-items-center gap-2 text-center">
            <span className="font-pixel text-sm leading-5 text-pixel-ink">
              No eggs!
            </span>
            <span className="font-pixel text-[9px] leading-4 text-pixel-muted">
              Buy some in the market.
            </span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-3 space-y-3">
      <div className="pixel-panel p-3">
        <div className="grid gap-2">
          <div className="font-pixel text-[10px] leading-4 text-pixel-ink">
            You have {sortedEggs.length}{" "}
            {sortedEggs.length > 1 ? "eggs" : "egg"}
          </div>
          {sortedEggs.map((egg) => (
            <div
              className="pixel-panel-soft flex items-center justify-between gap-2 p-2"
              key={egg.id}>
              <span className="font-pixel text-[9px] leading-4 text-pixel-ink">
                Egg-#{egg.id}
              </span>
              {/* <span>Is listed: {egg.isListed ? "Yes" : "No"} </span> */}
              <button
                className="pixel-button min-h-0 px-3 py-2 font-pixel text-[8px] leading-3 hover:scale-105 disabled:hover:scale-100"
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
