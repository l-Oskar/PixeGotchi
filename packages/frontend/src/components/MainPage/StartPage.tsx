import { useStartHatching } from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import { Egg, PageType } from "@shared";
import React, { useEffect } from "react";

interface StartPageProps {
  onNavigate: (page: PageType) => void;
}

const StartPage: React.FC<StartPageProps> = ({ onNavigate }) => {
  const allEggs = useEggStore((s) => s.allEggs);
  const startHatchingEgg = useStartHatching();
  if (!allEggs) return <div>Loading eggs...</div>;

  const handleHatch = (egg: Egg) => {
    startHatchingEgg.mutate(egg.id);
    console.log("Start hatching");
  };

  useEffect(() => {
    if (allEggs) return;
  }, [allEggs]);

  if (allEggs.length == 0)
    return <div className="m-10 flex justify-center text-2xl">No eggs</div>;

  return (
    <div className="grid justify-center text-2xl">
      {allEggs.map((egg) => (
        <div className="m-1 px-20 border rounded-xl" key={egg.id}>
          <span>🥚Egg-#{egg.id}</span>
          {/* <span>Is listed: {egg.isListed ? "Yes" : "No"} </span> */}
          <button
            className="m-2 px-2 py-1 border rounded-2xl border-fuchsia-500 hover:bg-fuchsia-500 hover:border-amber-50"
            onClick={() => {
              handleHatch(egg), onNavigate("egg");
            }}>
            Hatch
          </button>
        </div>
      ))}
    </div>
  );
};

export default StartPage;
