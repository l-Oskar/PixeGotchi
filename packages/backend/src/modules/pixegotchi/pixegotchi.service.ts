import { prisma } from "@/database/prisma";
import { Item, ITEM_EXP, MAX_EXP, RARITY_STATS } from "@shared";

export class PixegotchiService {
  async findByUserId(userId: number) {
    return await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { hatchedAt: "desc" },
    });
  }

  async findActive(userId: number) {
    const active = await prisma.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });
    return active ?? null;
  }

  async setInActive(userId: number) {
    const active = await this.findActive(userId);
    await prisma.pixegotchi.update({
      where: { id: active!.id },
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

  async applyStats(userId: number, item: Item, quantity: number = 1) {
    const pixegotchi = await this.findActive(userId);
    if (!pixegotchi) throw new Error("You don't have active pixegotchi");

    await this.addExp(userId, item, quantity);

    const maxStat = RARITY_STATS[pixegotchi.rarity].maxStat;

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
      const effectValue = Number(item.effects?.[stat]);
      if (effectValue === undefined || effectValue === null) continue;

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

    return await prisma.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data,
    });
  }

  async addExp(userId: number, item: Item, quantity: number = 1) {
    const pixegotchi = await this.findActive(userId);
    if (!pixegotchi) throw new Error("Not active pixegotchi");

    let exp = 0;

    if (item.itemId === "rare_candy") {
      exp = 1000 * quantity;
    } else {
      exp = ITEM_EXP[item.rarity] * quantity;
    }

    if (pixegotchi.experience + exp < MAX_EXP) {
      return await prisma.pixegotchi.update({
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

    return await prisma.pixegotchi.update({
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

    const lastUpdates = {
      lastFedDiff: time - activePixegotchi.lastFedAt!.getTime(),
      lastHealedDiff: time - activePixegotchi.lastHealedAt!.getTime(),
      lastCleanedDIff: activePixegotchi.lastCleanedAt!.getTime(),
      lastPlayseDiff: activePixegotchi.lastPlayedAt!.getTime(),
      lastBoostedDiff: activePixegotchi.lastBoostedAt!.getTime(),
      lastUpdatedDiff: activePixegotchi.lastUpdateAt.getTime(),
    };

    return lastUpdates;
  }
}
