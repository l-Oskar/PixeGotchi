import { TraitType } from "./traits";
import type {
  ElementType,
  RarityType,
  PixegotchiGender,
  PixegotchiStatus,
} from "../enums";

export interface Pixegotchi {
  id: number;
  userId: number;
  eggId: number;
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
  healthZeroAt: Date | string | null;
  criticalSince: Date | string | null;
  lastFedAt: Date | string | null;
  lastPlayedAt: Date | string | null;
  lastSleptAt: Date | string | null;
  lastCleanedAt: Date | string | null;
  lastHealedAt: Date | string | null;
  lastBoostedAt: Date | string | null;
  lastUpdateAt: Date | string | null;
  hatchedAt: Date | string | null;
}
export interface DeltaContext {
  level: number;
  rarity: RarityType;
}
export interface PixegotchiStats {
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
}
export interface PixegotchiState extends DeltaContext, PixegotchiStats {}

export interface Cooldowns {
  feed: boolean;
  play: boolean;
  sleep: boolean;
  clean: boolean;
  heal: boolean;
}

export interface TickContext {
  elapsedMs: number;
}

export interface RarityStatsType {
  maxStat: number;
  degradationReduce: number;
  traits: {
    min: number;
    max: number;
  };
  goldEarn: number;
}
export interface GenomeInfo {
  genome_hash: string;
  element: ElementType;
  rarity: RarityType;
  gender: PixegotchiGender;
  traits: TraitType[];
}

export interface PixegotchiContext extends Pixegotchi {
  userId: number;
  pixegotchi: Pixegotchi | null;
}
