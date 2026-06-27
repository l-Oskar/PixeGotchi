import React, { useState } from "react";
import { Pixegotchi, Egg, EggHatchingStatus } from "@pixegotchi/shared";
import { isEgg, isPixegotchi, getImage } from "@/utils/getImage";
import { MessageCircleHeart } from "lucide-react";

interface VisualProps {
  pet: Pixegotchi | Egg;
  status: EggHatchingStatus | null;
}

const EggDisplay: React.FC<{ egg: Egg; status: EggHatchingStatus }> = ({
  egg,
  status,
}) => {
  return (
    <div className="relative bg-linear-to-b from-blue-500/10 to-purple-500/10 rounded-2xl min-h-56 flex items-center justify-center border border-white/5">
      <div
        className={
          `text-9xl ` +
          (!status.canHatchNow ? "animate-egg-wobble" : "animate-egg-wobble")
        }>
        <img
          className="-mb-5 w-25 h-33"
          src={`./${getImage(egg, status)}`}
          alt={`Egg-${egg.id}`}
        />
      </div>
    </div>
  );
};

const PixegotchiDisplay: React.FC<{ pixe: Pixegotchi }> = ({ pixe }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHeart, setShowHeart] = useState(false);

  const handleClick = () => {
    // Запускаємо анімацію
    setIsAnimating(true);
    setShowHeart(true);

    // Через 2 секунди повертаємо все назад
    setTimeout(() => {
      setIsAnimating(false);
      setShowHeart(false);
    }, 2100);
  };

  return (
    <div className="relative bg-linear-to-b from-blue-500/10 to-purple-500/10 rounded-2xl h-56 flex items-center justify-center border border-white/5">
      <div
        className={`-mb-15 text-9xl ${isAnimating ? "animate-egg-wobble" : "animate-bounce"}`}>
        <img
          className="w-50 h-50 cursor-pointer hover:scale-105 transition-transform"
          src={`./${getImage(pixe)}`}
          alt={`Pixegotchi-${pixe.id}`}
          onClick={handleClick}
        />
      </div>

      {/* Сердечко */}
      {showHeart && (
        <div className="absolute inset-0 flex mb-10 ml-30 items-center justify-center pointer-events-none">
          <MessageCircleHeart size={30} className="animate-ping text-red-500" />
        </div>
      )}
    </div>
  );
};

export const Visual: React.FC<VisualProps> = ({ pet, status }) => {
  if (!pet) return <div>No Pet/No egg</div>;

  if (isEgg(pet)) {
    if (!status) {
      return null;
    }
    return <EggDisplay egg={pet} status={status} />;
  }

  if (isPixegotchi(pet)) {
    return <PixegotchiDisplay pixe={pet} />;
  }

  return null;
};
