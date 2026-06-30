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

const OCCUPIED_SLOT_STATUSES = ["active", "critical", "dead"] as const;

export class PixegotchiService {
  async findByUserId(userId: number) {
    return await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { hatchedAt: "desc" },
    });
  }

  async findCurrent(
    userId: number,
    db: PrismaExecutor = prisma,
  ): Promise<PrismaPixegotchi | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { currentPixegotchi: true },
    });

    const current = user?.currentPixegotchi;

    if (!current || current.userId !== userId) return null;
    if (!OCCUPIED_SLOT_STATUSES.some((status) => status === current.status))
      return null;

    return current;
  }

  async findActive(userId: number): Promise<PrismaPixegotchi | null> {
    return await this.findCurrent(userId);
  }

  async hasOccupiedPixegotchiSlot(userId: number, db: PrismaExecutor = prisma) {
    return (await this.findCurrent(userId, db)) !== null;
  }

  async setInActive(userId: number) {
    const active = await this.findCurrent(userId);

    if (!active) {
      throw new Error("No active pixegotchi");
    }

    if (active.status === "dead" || active.status === "critical") {
      throw new Error("Dead pixegotchi cannot be stored in vault");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedPixegotchi = await tx.pixegotchi.update({
        where: { id: active.id },
        data: {
          status: "vault",
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          currentPixegotchiId: null,
        },
      });

      return updatedPixegotchi;
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
    const pixegotchi = await this.findCurrent(userId, db);

    if (!pixegotchi) throw new Error("You don't have active pixegotchi");
    if (pixegotchi.status !== "active")
      throw new Error("Pixegotchi is not active");

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
    const pixegotchi = await this.findCurrent(userId, db);

    if (!pixegotchi) throw new Error("Not active pixegotchi");
    if (pixegotchi.status !== "active")
      throw new Error("Pixegotchi is not active");

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
    const currentPixegotchi = await this.findCurrent(userId);

    if (!currentPixegotchi) return null;

    const getDiffMs = (date: Date | null) => {
      return date ? time - date.getTime() : null;
    };

    const lastUpdates = {
      lastFedDiffMs: getDiffMs(currentPixegotchi.lastFedAt),
      lastHealedDiffMs: getDiffMs(currentPixegotchi.lastHealedAt),
      lastCleanedDiffMs: getDiffMs(currentPixegotchi.lastCleanedAt),
      lastPlayedDiffMs: getDiffMs(currentPixegotchi.lastPlayedAt),
      lastBoostedDiffMs: getDiffMs(currentPixegotchi.lastBoostedAt),
      lastUpdatedDiffMs: time - currentPixegotchi.lastUpdateAt.getTime(),
    };

    return lastUpdates;
  }
}
