import {
  Egg,
  Pixegotchi,
  EggHatchingStatus,
  EggEvolutionStage,
  PixegotchiEvolutionStage,
  ElementStats,
  ChestType,
} from "@pixegotchi/shared";

type Pet = Egg | Pixegotchi;

const CHEST_SPRITE_SRC = "assets/chests/Chests.png";
const CHEST_SPRITE_SIZE = 32;
const CHEST_SPRITE_WIDTH = 288;
const CHEST_SPRITE_HEIGHT = 128;
const CHEST_SPRITE_SCALE = 3;
const CHEST_SPRITE_RENDER_SIZE = CHEST_SPRITE_SIZE * CHEST_SPRITE_SCALE;

const CHEST_SPRITE_COLUMN: Record<ChestType, number> = {
  wooden: 6,
  silver: 3,
  golden: 4,
  crystal: 0,
  mythic: 1,
  legendary: 2,
};

export function isEgg(pet: Pet): pet is Egg {
  return "isHatching" in pet && "hatchStartedAt" in pet;
}

export function isPixegotchi(pet: Pet): pet is Pixegotchi {
  return "level" in pet && "element" in pet;
}

export function getPixegotchiEvolution(level: number) {
  if (level < 30) {
    return PixegotchiEvolutionStage.BABY;
  }
  if (level >= 30 && level < 59) {
    return PixegotchiEvolutionStage.TEEN;
  } else {
    return PixegotchiEvolutionStage.ADULT;
  }
}

export function getPixegotchiImgOld(pixegotchi: Pixegotchi) {
  return `pixegotchi/${pixegotchi.element}-${getPixegotchiEvolution(pixegotchi.level)}.png`;
}

export function getPixegotchiImg(
  pixegotchi: Pixegotchi | ElementStats,
): string {
  let level: number;
  let element: string;

  if ("level" in pixegotchi) {
    level = pixegotchi.level;
    element = pixegotchi.element;
  } else {
    level = pixegotchi.highestLevel;
    element = pixegotchi.element;
  }
  const evolution = getPixegotchiEvolution(level);

  return `pixegotchi/${element}-${evolution}.png`;
}

export function getEggEvolution(status: EggHatchingStatus) {
  if (!status.isHatching) {
    return EggEvolutionStage.BASE;
  }
  const progress = status.progress;
  if (progress < 20) return EggEvolutionStage.BASE;
  if (progress < 40) return EggEvolutionStage.STAGE_1;
  if (progress < 60) return EggEvolutionStage.STAGE_2;
  if (progress < 80) return EggEvolutionStage.STAGE_3;
  if (progress < 100) return EggEvolutionStage.STAGE_4;
  return EggEvolutionStage.HATCHED;
}

export function getEggImg(status?: EggHatchingStatus) {
  if (!status) return "eggs/egg-1.png";
  return `eggs/egg-${getEggEvolution(status)}.png`;
}

export function getChestImg(chestType: ChestType) {
  const column = CHEST_SPRITE_COLUMN[chestType];

  return {
    src: CHEST_SPRITE_SRC,
    size: CHEST_SPRITE_RENDER_SIZE,
    backgroundPosition: `-${column * CHEST_SPRITE_RENDER_SIZE}px 0px`,
    backgroundSize: `${CHEST_SPRITE_WIDTH * CHEST_SPRITE_SCALE}px ${CHEST_SPRITE_HEIGHT * CHEST_SPRITE_SCALE}px`,
  };
}

export function getImage(pet: Pet, status?: EggHatchingStatus) {
  if (isEgg(pet)) {
    if (!status) {
      console.warn("Egg status is required for egg image");
      return "eggs/egg-0.png";
    }
    return getEggImg(status);
  }
  if (isPixegotchi(pet)) {
    return getPixegotchiImg(pet);
  }

  return "default.png";
}
