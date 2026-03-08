import type {
  ElementType,
  RarityType,
  PixegotchiGender,
  PixegotchiStatus,
} from "../enums";

export interface Pixegotchi {
  id: number;
  userId: number;
  nftAddress: string | null;
  genomeHash: string;
  element: ElementType;
  rarity: RarityType;
  gender: PixegotchiGender;
  traits: string[];
  name: string;
  status: PixegotchiStatus;
  level: number;
  experience: number;

  // Stats (0–100)
  health: number | string;
  hunger: number | string;
  energy: number | string;
  happiness: number | string;
  cleanliness: number | string;

  // Timestamps
  criticalSince: Date | string | null;
  lastFedAt: Date | string | null;
  lastPlayedAt: Date | string | null;
  lastSleptAt: Date | string | null;
  lastCleanedAt: Date | string | null;
  lastHealedAt: Date | string | null;
  lastUpdateAt: Date | string | null;
  hatchedAt: Date | string | null;
}

export interface PixegotchiStats {
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
}

export interface Cooldowns {
  feed: boolean;
  play: boolean;
  sleep: boolean;
  clean: boolean;
  heal: boolean;
}

export interface RarityStatsType {
  maxStatus: number;
  degradationReduce: number;
  traits: {
    min: number;
    max: number;
  };
  goldEarn: number;
}

export interface RarityStats {
  common: RarityStatsType;
  uncommon: RarityStatsType;
  rare: RarityStatsType;
  epic: RarityStatsType;
  mythic: RarityStatsType;
  legendary: RarityStatsType;
}
