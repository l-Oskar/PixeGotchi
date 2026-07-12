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

export interface GameConfig {
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  difficultyMultiplier: number;
  icon: string;
  energyCost: number;
  minDuration: number;
  maxScorePerSecond: number;
  chestDropChance: number;

  maxScore?: number;
}
