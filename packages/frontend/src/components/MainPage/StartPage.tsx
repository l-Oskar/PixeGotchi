import { useStartHatching } from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import { Egg } from "@shared";
import { useEffect } from "react";

const StartPage = () => {
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

  return (
    <div>
      {allEggs.map((egg) => (
        <div key={egg.id}>
          <span>🥚Egg-#{egg.id} | </span>
          <span>Created at: {egg.createdAt.toString().split("T")[0]}</span>
          {/* <span>Is listed: {egg.isListed ? "Yes" : "No"} </span> */}
          <button
            className="m-2 p-2 border rounded-2xl border-fuchsia-500 hover:bg-fuchsia-500 hover:border-amber-50"
            onClick={() => handleHatch(egg)}>
            Hatch
          </button>
        </div>
      ))}
    </div>
  );
};

export default StartPage;
