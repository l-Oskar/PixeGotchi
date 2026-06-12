import {
  Egg,
  Pixegotchi,
  EggHatchingStatus,
  EggEvolutionStage,
  PixegotchiEvolutionStage,
  ElementStats,
} from "@shared";

type Pet = Egg | Pixegotchi;

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
