import React from "react";
import { Pixegotchi, Egg, EggHatchingStatus } from "@shared";
import { isEgg, isPixegotchi, getImage } from "@/utils/getImage";

interface VisualProps {
  pet: Pixegotchi | Egg;
  status: EggHatchingStatus | null;
}

const EggDisplay: React.FC<{ egg: Egg; status: EggHatchingStatus }> = ({
  egg,
  status,
}) => {
  return (
    <div className="relative bg-linear-to-b from-blue-500/10 to-purple-500/10 rounded-2xl h-56 flex items-center justify-center border border-white/5">
      <div
        className={
          `text-9xl ` +
          (!status.canHatchNow ? "animate-egg-wobble" : "animate-pulse")
        }>
        <img
          className="w-25 h-33"
          src={`./${getImage(egg, status!)}`}
          alt={`Egg-${egg.id}`}
        />
      </div>
    </div>
  );
};

const PixegotchiDisplay: React.FC<{ pixe: Pixegotchi }> = ({ pixe }) => {
  return (
    <div className="relative bg-linear-to-b from-blue-500/10 to-purple-500/10 rounded-2xl h-56 flex items-center justify-center border border-white/5">
      <div className="-mb-15 text-9xl animate-bounce">
        <img
          className="w-50 h-50"
          src={`./${getImage(pixe)}`}
          alt={`Pixegotchi-${pixe.id}`}
        />
      </div>
    </div>
  );
};

export const Visual: React.FC<VisualProps> = ({ pet, status }) => {
  if (!pet) return <div>No Pet/No egg</div>;

  if (isEgg(pet)) {
    if (!status) {
      console.log("No status for egg");
      return null;
    }
    return <EggDisplay egg={pet} status={status} />;
  }

  if (isPixegotchi(pet)) {
    return <PixegotchiDisplay pixe={pet} />;
  }

  return null;
};
