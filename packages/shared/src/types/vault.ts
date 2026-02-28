export interface ElementStats {
  element: string;
  count: number;
  bestRarity: string;
  highestLevel: number;
  isEmpty: boolean;
}

export interface VaultStats {
  fire: ElementStats;
  water: ElementStats;
  earth: ElementStats;
  air: ElementStats;
  electric: ElementStats;
  ice: ElementStats;
  grass: ElementStats;
  metal: ElementStats;
  ghost: ElementStats;
  poison: ElementStats;
  psychic: ElementStats;
  light: ElementStats;
  dark: ElementStats;
  rainbow: ElementStats;
}
