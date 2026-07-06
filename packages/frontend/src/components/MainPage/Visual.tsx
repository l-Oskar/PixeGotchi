import React, { useState } from "react";
import { Pixegotchi, Egg, EggHatchingStatus } from "@pixegotchi/shared";
import { isEgg, isPixegotchi, getImage } from "@/utils/getImage";
import { MessageCircleHeart } from "lucide-react";
import { RoomScene } from "./RoomScene";

interface VisualProps {
  pet: Pixegotchi | Egg;
  status: EggHatchingStatus | null;
}

const EggDisplay: React.FC<{ egg: Egg; status: EggHatchingStatus }> = ({
  egg,
  status,
}) => {
  return (
    <RoomScene>
      <div
        className={
          `text-9xl ` +
          (!status.canHatchNow ? "animate-egg-wobble" : "animate-egg-wobble")
        }>
        <img
          className="-mb-4 h-30 w-23 pixelated"
          src={`./${getImage(egg, status)}`}
          alt={`Egg-${egg.id}`}
        />
      </div>
    </RoomScene>
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
    <RoomScene>
      <div
        className={`-mb-22 translate-x-22 text-9xl max-[380px]:translate-x-12 ${isAnimating ? "animate-egg-wobble" : "animate-pet-idle"}`}>
        <img
          className="h-40 w-40 cursor-pointer transition-transform hover:scale-105 pixelated max-[380px]:h-36 max-[380px]:w-36"
          src={`./${getImage(pixe)}`}
          alt={`Pixegotchi-${pixe.id}`}
          onClick={handleClick}
        />
      </div>

      {/* Сердечко */}
      {showHeart && (
        <div className="absolute inset-0 flex mb-20 ml-68 items-center justify-center pointer-events-none">
          <MessageCircleHeart size={30} className="animate-ping text-red-500" />
        </div>
      )}
    </RoomScene>
  );
};

export const Visual: React.FC<VisualProps> = ({ pet, status }) => {
  if (!pet) {
    return (
      <div className="pixel-panel-soft flex h-48 items-center justify-center">
        <span className="font-pixel text-[9px] leading-4 text-pixel-muted">
          No Pet / No egg
        </span>
      </div>
    );
  }

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
