import { LucideIcon } from "lucide-react";

// Types
export type PageType = "home" | "inventory" | "games" | "marketplace" | "vault";

export type ElementType = "fire" | "water" | "earth" | "air" | "light" | "dark";
export type RarityType = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Tamagotchi {
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

export interface InventoryItem {
  id: number;
  name: string;
  type: "food" | "medicine" | "chest" | "special";
  quantity: number;
  icon: string;
}

export interface Game {
  id: number;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  icon: string;
}

export interface MarketplaceListing {
  id: number;
  item: string;
  price: number;
  currency: "TMC" | "TON";
  seller: string;
  icon: string;
}

export interface VaultItem {
  id: number;
  name: string;
  level: number;
  element: ElementType;
  icon: string;
}

export interface Cooldowns {
  feed: boolean;
  play: boolean;
  sleep: boolean;
  clean: boolean;
  heal: boolean;
}

export interface HomePageProps {
  tama: Tamagotchi;
  onNavigate: (page: PageType) => void;
  setActiveTamagotchi: (tama: Tamagotchi) => void;
}

export interface NavigatePageProps {
  onNavigate?: (page: PageType) => void;
}

export interface CompactStatProps {
  icon: LucideIcon;
  value: number;
  bgColor: string;
  strokeColor: string;
}

export interface StatBarProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}

export interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  gradient: string;
}
