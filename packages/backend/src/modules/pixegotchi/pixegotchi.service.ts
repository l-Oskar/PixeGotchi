import { prisma } from "@/database/prisma";
import {
  Item,
  ITEM_EXP,
  MAX_EXP,
  RARE_CANDY_EXP,
  RARITY_STATS,
  RarityType,
} from "@pixegotchi/shared";
import type {
  Pixegotchi as PrismaPixegotchi,
  Prisma,
} from "@/generated/prisma/client";

type PrismaExecutor = typeof prisma | Prisma.TransactionClient;

export class PixegotchiService {
  async findByUserId(userId: number) {
    return await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { hatchedAt: "desc" },
    });
  }

  async findActive(userId: number): Promise<PrismaPixegotchi | null> {
    const active = await prisma.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });
    return active ?? null;
  }

  async setInActive(userId: number) {
    const active = await this.findActive(userId);

    if (!active) {
      throw new Error("No active pixegotchi");
    }

    return await prisma.pixegotchi.update({
      where: { id: active.id },
      data: {
        status: "vault",
      },
    });
  }

  // Get by ID with ownership check
  async findById(id: number, userId: number) {
    return await prisma.pixegotchi.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  async storedInVault(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi not found");

    if (pixegotchi.level % 10 !== 0)
      throw new Error("Can only store at levels 10, 20, 30...");

    return await prisma.$transaction(async (tx) => {
      await tx.pixegotchi.update({
        where: { id },
        data: {
          status: "vault",
        },
      });

      return await tx.vault.create({
        data: {
          userId,
          pixegotchiId: id,
          finalLevel: pixegotchi.level,
        },
      });
    });
  }

  async applyStats(
    userId: number,
    item: Item,
    quantity: number = 1,
    db: PrismaExecutor = prisma,
  ) {
    const pixegotchi = await db.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });

    if (!pixegotchi) throw new Error("You don't have active pixegotchi");

    await this.addExp(userId, item, quantity, db);

    const maxStat = RARITY_STATS[pixegotchi.rarity as RarityType].maxStat;

    const TIMESTAMP_MAP: Partial<
      Record<keyof NonNullable<Item["effects"]>, string>
    > = {
      hunger: "lastFedAt",
      health: "lastHealedAt",
      happiness: "lastPlayedAt",
      cleanliness: "lastCleanedAt",
      energy: "lastBoostedAt",
    };

    const statKeys = Object.keys(TIMESTAMP_MAP) as Array<
      keyof NonNullable<Item["effects"]>
    >;

    const data: Record<string, unknown> = {};

    for (const stat of statKeys) {
      const effectValue = item.effects?.[stat];
      if (!effectValue || typeof effectValue !== "number") continue;

      data[stat as string] = Math.min(
        maxStat,
        Math.max(
          0,
          (pixegotchi[stat as keyof typeof pixegotchi] as number) +
            effectValue * quantity,
        ),
      );
      data[TIMESTAMP_MAP[stat]!] = new Date();
    }

    return await db.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data,
    });
  }

  async addExp(
    userId: number,
    item: Item,
    quantity: number = 1,
    db: PrismaExecutor = prisma,
  ) {
    const pixegotchi = await db.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });

    if (!pixegotchi) throw new Error("Not active pixegotchi");

    let exp = 0;

    if (item.itemId === "rare_candy") {
      exp = RARE_CANDY_EXP * quantity;
    } else {
      exp = ITEM_EXP[item.rarity] * quantity;
    }

    if (pixegotchi.experience + exp < MAX_EXP) {
      return await db.pixegotchi.update({
        where: {
          id: pixegotchi.id,
        },
        data: {
          experience: { increment: exp },
        },
      });
    }

    const addLvl = Math.floor((pixegotchi.experience + exp) / 1000);
    const addExp = (pixegotchi.experience + exp) % 1000;

    return await db.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data: {
        experience: addExp,
        level: { increment: addLvl },
      },
    });
  }

  async checkStatus(userId: number) {
    const time = Date.now();
    const activePixegotchi = await this.findActive(userId);

    if (!activePixegotchi) return null;

    const getDiffMs = (date: Date | null) => {
      return date ? time - date.getTime() : null;
    };

    const lastUpdates = {
      lastFedDiffMs: getDiffMs(activePixegotchi.lastFedAt),
      lastHealedDiffMs: getDiffMs(activePixegotchi.lastHealedAt),
      lastCleanedDiffMs: getDiffMs(activePixegotchi.lastCleanedAt),
      lastPlayedDiffMs: getDiffMs(activePixegotchi.lastPlayedAt),
      lastBoostedDiffMs: getDiffMs(activePixegotchi.lastBoostedAt),
      lastUpdatedDiffMs: time - activePixegotchi.lastUpdateAt.getTime(),
    };

    return lastUpdates;
  }
}
