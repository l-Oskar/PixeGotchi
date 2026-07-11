import { GameConfig } from "../../types/game";

export const CATCH_FRUITS_CONFIG: GameConfig = {
  name: "Catch Fruits",
  difficulty: "Easy",
  rewardLabel: "50-100",
  expLabel: "10-50",
  icon: "🍌",
  energyCost: 10,
  minDuration: 30,
  maxScorePerSecond: 8,
  pgcPerPoint: 0.5,
  expPerPoint: 0.1,
  chestDropChance: 0.7,
};
