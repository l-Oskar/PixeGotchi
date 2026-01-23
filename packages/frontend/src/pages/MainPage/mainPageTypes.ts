// Types
export type PageType = "home" | "inventory" | "games" | "marketplace" | "vault";

export type ElementType =
  | "fire"
  | "water"
  | "earth"
  | "air"
  | "light"
  | "dark"
  | "rainbow";
export type RarityType = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Pixegotchi {
  name: string;
  level: number;
  element: ElementType;
  rarity: RarityType;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  experience: number;
  nextLevelExp: number;
}

export interface Cooldowns {
  feed: boolean;
  play: boolean;
  sleep: boolean;
  clean: boolean;
  heal: boolean;
}

export interface HomePageProps {
  tama: Pixegotchi;
  onNavigate: (page: PageType) => void;
  setActivePixegotchi: (tama: Pixegotchi) => void;
}
