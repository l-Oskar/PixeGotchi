import React, { useState } from "react";
import { Pixegotchi, Egg, EggHatchingStatus } from "@pixegotchi/shared";
import { isEgg, isPixegotchi, getImage } from "@/utils/getImage";
import { MessageCircleHeart } from "lucide-react";
import { RoomScene } from "./RoomScene";
import type { RoomFloorId, RoomWallId } from "./roomSurfaces";
import type { RoomAssetPlacement } from "./roomSlots";

interface VisualProps {
  pet: Pixegotchi | Egg;
  status: EggHatchingStatus | null;
  centerPet?: boolean;
  hidePet?: boolean;
  wallId?: RoomWallId;
  floorId?: RoomFloorId;
  assets?: RoomAssetPlacement[];
  showSlotGuides?: boolean;
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

const PixegotchiDisplay: React.FC<{
  pixe: Pixegotchi;
  centered?: boolean;
  hidePet?: boolean;
  wallId?: RoomWallId;
  floorId?: RoomFloorId;
  assets?: RoomAssetPlacement[];
  showSlotGuides?: boolean;
}> = ({
  pixe,
  centered = false,
  hidePet = false,
  wallId,
  floorId,
  assets,
  showSlotGuides = false,
}) => {
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
    <RoomScene
      wallId={wallId}
      floorId={floorId}
      assets={assets}
      showSlotGuides={showSlotGuides}>
      {!hidePet && (
        <div
          className={`translate-y-[clamp(2.5rem,12vw,3.25rem)] text-9xl transition-transform duration-300 ${centered ? "translate-x-0" : "translate-x-[clamp(3rem,18vw,4.75rem)]"}`}>
          <div
            className={
              isAnimating ? "animate-egg-wobble" : "animate-pet-idle"
            }>
            <img
              className="h-[clamp(9rem,38vw,10rem)] w-[clamp(9rem,38vw,10rem)] cursor-pointer transition-transform hover:scale-105 pixelated"
              src={`./${getImage(pixe)}`}
              alt={`Pixegotchi-${pixe.id}`}
              onClick={handleClick}
            />
          </div>
        </div>
      )}

      {/* Сердечко */}
      {!hidePet && showHeart && (
        <div className="absolute inset-0 flex mb-20 ml-68 items-center justify-center pointer-events-none">
          <MessageCircleHeart size={30} className="animate-ping text-red-500" />
        </div>
      )}
    </RoomScene>
  );
};

export const Visual: React.FC<VisualProps> = ({
  pet,
  status,
  centerPet = false,
  hidePet = false,
  wallId,
  floorId,
  assets,
  showSlotGuides = false,
}) => {
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
    return (
      <PixegotchiDisplay
        pixe={pet}
        centered={centerPet}
        hidePet={hidePet}
        wallId={wallId}
        floorId={floorId}
        assets={assets}
        showSlotGuides={showSlotGuides}
      />
    );
  }

  return null;
};
