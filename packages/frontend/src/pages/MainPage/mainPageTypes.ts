// Types
export type PageType =
  | "home"
  | "egg"
  | "inventory"
  | "games"
  | "marketplace"
  | "vault";

export type ElementType =
  | "fire"
  | "water"
  | "earth"
  | "air"
  | "electric"
  | "ice"
  | "grass"
  | "metal"
  | "ghost"
  | "poison"
  | "psychic"
  | "light"
  | "dark"
  | "rainbow";
export type RarityType =
  | "common"
  | "uncommon"
  | "rare"
  | "mythic"
  | "epic"
  | "legendary"
  | "unique";
export type PixegotchiGender = "male" | "female";

export interface Pixegotchi {
  id: number;
  userId: number | null;
  nftAddress: string | null;
  genomeHash: string | null;
  element: ElementType | null;
  rarity: RarityType | null;
  gender: PixegotchiGender | null;
  name: string | null;
  status: string;
  level: number;
  experience: number;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  criticalSince: Date | null;
  lastFedAt: Date | null;
  lastPlayedAt: Date | null;
  lastSleptAt: Date | null;
  lastCleanedAt: Date | null;
  lastHealedAt: Date | null;
  lastUpdateAt: Date | null;
  createdAt: Date | null;
}

export interface Cooldowns {
  feed: boolean;
  play: boolean;
  sleep: boolean;
  clean: boolean;
  heal: boolean;
}

export interface User {
  id: number;
  telegramId: string;
  username?: string;
  pgcBalance: string;
}

export interface HomePageProps {
  tama: Pixegotchi | null;
  onNavigate: (page: PageType) => void;
}
