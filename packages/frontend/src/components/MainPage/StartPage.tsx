import { useStartHatching } from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import { Egg, PageType } from "@pixegotchi/shared";
import React from "react";
import Loader from "../Other/Loader";

interface StartPageProps {
  onNavigate: (page: PageType) => void;
}

const StartPage: React.FC<StartPageProps> = ({ onNavigate }) => {
  const allEggs = useEggStore((s) => s.allEggs);
  const startHatchingEgg = useStartHatching();

  if (!allEggs) return <Loader title={"Loading eggs..."} />;

  const handleHatch = (egg: Egg) => {
    startHatchingEgg.mutate(egg.id);
    console.log("Start hatching");
  };

  if (allEggs.length == 0)
    return (
      <div className="p-4 space-y-4">
        <div className="min-h-100 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl border border-white/10 backdrop-blur-sm">
          <div className="p-4 grid gap-2 justify-center text-xl">
            <span className="text-center">No eggs!</span>
            <span>Buy some in the market.</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      <div className="min-h-100 p-6 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl border border-white/10 backdrop-blur-sm">
        <div className="grid gap-2 text-xl">
          <div>
            You have {allEggs.length} {allEggs.length > 1 ? "eggs" : "egg"}
          </div>
          {allEggs.map((egg) => (
            <div
              className="flex justify-between items-center bg-white/5 rounded-2xl p-4 border border-white/10"
              key={egg.id}>
              <span>🥚 Egg-#{egg.id}</span>
              {/* <span>Is listed: {egg.isListed ? "Yes" : "No"} </span> */}
              <button
                className="px-4 py-1.5 bg-linear-to-r from-purple-500 to-pink-500 rounded-full text-sm font-medium hover:scale-105 transition"
                onClick={() => {
                  handleHatch(egg), onNavigate("egg");
                }}>
                HATCH
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StartPage;
