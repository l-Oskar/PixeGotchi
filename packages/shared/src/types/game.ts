export type GameSession = {
  id: number;
  userId: number;
  pixegotchiId: number;
  gameId: string;
  score: number;
  duration: number;
  pgcEarned: string;
  experienceGained: number;
  energySpent: number;
  chestDropped: boolean;
  itemsDropped: unknown | null;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type StartGameSessionInput = {
  pixegotchiId: number;
  gameId: string;
};

export type CompleteGameSessionPayload = {
  score: number;
};

export type CompleteGameSessionInput = CompleteGameSessionPayload & {
  sessionId: number;
};

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
  maxScorePerSecond: number;
  pgcPerPoint: number;
  expPerPoint: number;
  chestDropChance: number;

  maxScore?: number;
}
