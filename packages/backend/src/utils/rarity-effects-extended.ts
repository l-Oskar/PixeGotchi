import { RarityType, ElementType } from "@shared";
// Опис спеціальних здібностей
export const SPECIAL_ABILITIES_DESCRIPTION: Record<string, string> = {
  enhanced_luck: "+10% шанс критичного успіху в іграх",
  legendary_aura: "Підвищує щастя сусідніх петів на +5%",
  auto_heal: "Автоматично відновлює 1 HP кожні 10 хвилин",
  unique_power: "Унікальна здібність залежно від елемента",
  time_manipulation: "Може прискорити час на 50% раз на день",
  resource_magnet: "Подвійний шанс знайти рідкісні предмети",
};

// Бонуси від комбінації рідкості та елемента
export interface ElementRarityBonus {
  bonus: string;
  value: number;
}

export const ELEMENT_RARITY_BONUSES: Partial<
  Record<ElementType, Partial<Record<RarityType, ElementRarityBonus>>>
> = {
  fire: {
    legendary: {
      bonus: "eternal_flame",
      value: 1.5, // x1.5 до energy regeneration
    },
  },
  water: {
    legendary: {
      bonus: "ocean_blessing",
      value: 2.0, // x2 до cleanliness degradation resistance
    },
  },
  rainbow: {
    legendary: {
      bonus: "prismatic_power",
      value: 2.5, // x2.5 до всіх заробітків
    },
    unique: {
      bonus: "ultimate_spectrum",
      value: 5.0, // x5 до всього
    },
  },
};
