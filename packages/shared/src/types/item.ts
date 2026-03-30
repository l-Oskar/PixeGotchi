import type { ItemType, RarityType } from "../enums";
import type { ItemBuffs } from "./item_buffs";

export interface ItemEffects {
  hunger: number;
  happiness: number;
  health: number;
  cleanliness: number;
  energy: number;
  buffs: ItemBuffs[] | [];
}

export interface RarityChestType {
  quantity: {
    min: number;
    max: number;
  };
  eggChance: number;
}

export interface Item {
  itemId: string;
  name: string;
  description: string | null;
  itemType: ItemType;
  rarity: RarityType;
  effects: ItemEffects | null;
  cooldownMinutes: number | null;
  maxPerDay: number | null;
  minLevel: number | null;
  iconUrl: string | null;
  isStackable: boolean;
  maxStack: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function parseItemEffects(rawEffects: unknown): ItemEffects | null {
  if (!rawEffects || typeof rawEffects !== "object") {
    return null;
  }

  const effects = rawEffects as Record<string, unknown>;

  return {
    hunger: Number(effects.hunger) || 0,
    happiness: Number(effects.happiness) || 0,
    health: Number(effects.health) || 0,
    cleanliness: Number(effects.cleanliness) || 0,
    energy: Number(effects.energy) || 0,
    buffs: (effects.buffs as ItemBuffs[]) || [],
  };
}

/**
 * Конвертує Prisma Item у тип Item
 */
export function parseItem(prismaItem: {
  itemId: string;
  name: string;
  description: string | null;
  itemType: ItemType;
  rarity: RarityType;
  effects: unknown;
  cooldownMinutes: number | null;
  maxPerDay: number | null;
  minLevel: number | null;
  iconUrl: string | null;
  isStackable: boolean;
  maxStack: number | null;
  createdAt: Date;
  updatedAt: Date;
}): Item {
  return {
    ...prismaItem,
    effects: parseItemEffects(prismaItem.effects),
    createdAt: prismaItem.createdAt.toISOString(),
    updatedAt: prismaItem.updatedAt.toISOString(),
  };
}
