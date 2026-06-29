export interface GameStruct {
  id: number;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  energy: number;
  exp: string;
  reward: string;
  icon: string;
}

export interface GameConfig {
  energyCost: number;
  minDuration: number;
  pgcPerPoint: number;
  expPerPoint: number;
  chestDropChance: number;
  maxScore: number;
}
