import { useStartHatching } from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import { Egg } from "@shared";

const StartPage = () => {
  const allEggs = useEggStore((s) => s.allEggs);
  const startHatchingEgg = useStartHatching();
  if (!allEggs) return <div>Loading eggs...</div>;

  const handleHatch = (egg: Egg) => {
    startHatchingEgg.mutate(egg.id);
    console.log("Start hatching");
  };

  return (
    <div>
      {allEggs.map((egg) => (
        <div key={egg.id}>
          <span>Egg-#{egg.id} </span>
          <span>Created at: {egg.createdAt.toString().split("T")[0]} </span>
          <span>Is listed: {egg.isListed ? "Yes" : "No"} </span>
          <button onClick={() => handleHatch(egg)}>Hatch</button>
        </div>
      ))}
    </div>
  );
};

export default StartPage;
