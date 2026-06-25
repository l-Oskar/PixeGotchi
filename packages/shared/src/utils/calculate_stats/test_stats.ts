import { RARITY_STATS } from "../../constants/pixegotchi_const";
import { RarityType } from "../../enums";
import { getFinalCleanlinessDelta } from "./calculate_cleanliness";
import { percentToValue, round } from "./calculate_delta";
import { getFinalEnergyDelta } from "./calculate_energy";
import { getFinalHappinessDelta } from "./calculate_happiness";
import { getFinalHealthDelta } from "./calculate_health";
import { getFinalHungerDelta } from "./calculate_hunger";

export function getStats(
  hunger: number,
  cleanliness: number,
  health: number,
  level: number,
  rarity: RarityType,
  time: number,
): string {
  const max = RARITY_STATS[rarity].maxStat;
  const finalHunger = getFinalHungerDelta(level, rarity) * time;
  const finalCleanliness = getFinalCleanlinessDelta(level, rarity) * time;
  const finalHealth =
    getFinalHealthDelta(
      level,
      percentToValue(hunger, max),
      percentToValue(cleanliness, max),
      rarity,
    ) * time;
  const finalHappiness =
    getFinalHappinessDelta(
      level,
      percentToValue(hunger, max),
      percentToValue(cleanliness, max),
      rarity,
    ) * time;
  const finalEnergy =
    getFinalEnergyDelta(
      level,
      percentToValue(hunger, max),
      percentToValue(health, max),
      rarity,
    ) * time;
  const stats = `--------------------
    Rarity: ${rarity.toUpperCase()}
    Level: ${level} | Time: ${time}h
    Hunger: ${round(finalHunger)} | ${max + finalHunger}/${max}
    Cleanliness: ${round(finalCleanliness)} | ${max + finalCleanliness}/${max}
    Health: ${round(finalHealth)} | ${max + finalHealth}/${max}
    Happiness: ${round(finalHappiness)} | ${max + finalHappiness}/${max}
    Energy: ${round(finalEnergy)} | toMax: ${max - finalEnergy}
    --------------------`;
  return stats;
}

const test = () => {
  const level = 10;
  const time = 5;
  // for (const key of Object.keys(RarityType)) {
  //   console.log(
  //     getStats(hunger, cleanliness, health, level, key as RarityType, time),
  //   );
  // }
  console.log(getStats(10, 10, 50, level, "common", time));
  console.log(getStats(30, 30, 50, level, "common", time));
  console.log(getStats(50, 50, 50, level, "common", time));
  console.log(getStats(80, 80, 50, level, "common", time));
};

test();
