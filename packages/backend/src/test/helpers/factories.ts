import { prisma } from "@/database/prisma";
import {
  CREATE_STATS,
  EGG_CONSTANTS,
  ElementType,
  ItemType,
  RarityType,
} from "@pixegotchi/shared";

let telegramIdSequence = 10_000;

export async function createUser(overrides: Record<string, unknown> = {}) {
  telegramIdSequence += 1;

  return prisma.user.create({
    data: {
      telegramId: BigInt(telegramIdSequence),
      username: `user-${telegramIdSequence}`,
      pgcBalance: 1_000,
      ...overrides,
    },
  });
}

export async function createEgg(
  userId: number,
  overrides: Record<string, unknown> = {},
) {
  return prisma.egg.create({
    data: {
      userId,
      hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
      ...overrides,
    },
  });
}

export async function createItem(overrides: Record<string, unknown> = {}) {
  return prisma.item.create({
    data: {
      itemId: "apple",
      name: "Apple",
      description: "Test food item",
      itemType: ItemType.food,
      rarity: RarityType.common,
      effects: {
        hunger: 15,
        happiness: 0,
        health: 0,
        cleanliness: 0,
        energy: 0,
        buffs: [],
      },
      cooldownMinutes: null,
      maxPerDay: null,
      minLevel: 1,
      iconUrl: null,
      isStackable: true,
      maxStack: 99,
      ...overrides,
    },
  });
}

export async function createPixegotchi(
  userId: number,
  overrides: Record<string, unknown> = {},
) {
  const egg = await createEgg(userId, { isHatched: true });

  return prisma.pixegotchi.create({
    data: {
      userId,
      eggId: egg.id,
      genomeHash: "1770393107839-j5pytpw3rzf-557d1f910af4e0dbf5fe4add0576b038",
      element: ElementType.fire,
      rarity: RarityType.common,
      gender: "male",
      traits: [],
      name: "Testgo",
      status: "active",
      health: CREATE_STATS.health,
      hunger: CREATE_STATS.hunger,
      energy: CREATE_STATS.energy,
      happiness: CREATE_STATS.happiness,
      cleanliness: CREATE_STATS.cleanliness,
      lastFedAt: new Date(),
      lastHealedAt: new Date(),
      lastPlayedAt: new Date(),
      lastCleanedAt: new Date(),
      lastBoostedAt: new Date(),
      lastSleptAt: new Date(),
      lastUpdateAt: new Date(),
      ...overrides,
    },
  });
}
