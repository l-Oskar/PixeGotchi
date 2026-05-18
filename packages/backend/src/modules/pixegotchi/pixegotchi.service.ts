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

    await this.addExp(userId, ITEM_EXP[item.rarity] * quantity);

    let data = {};

    switch (item.itemType) {
      case "food":
        data = {
          hunger: Math.min(
            RARITY_STATS[pixegotchi.rarity].maxStat,
            pixegotchi.hunger + (item.effects?.hunger ?? 0) * quantity,
          ),
          lastFedAt: new Date(),
        };
        break;
      case "medicine":
        data = {
          health: Math.min(
            RARITY_STATS[pixegotchi.rarity].maxStat,
            pixegotchi.health + (item.effects?.health ?? 0) * quantity,
          ),
          lastHealedAt: new Date(),
        };
        break;
      case "toy":
        data = {
          happines: Math.min(
            RARITY_STATS[pixegotchi.rarity].maxStat,
            pixegotchi.happiness + (item.effects?.happiness ?? 0) * quantity,
          ),
          lastPlayedAt: new Date(),
        };
        break;
      case "cleaning":
        data = {
          cleanliness: Math.min(
            RARITY_STATS[pixegotchi.rarity].maxStat,
            pixegotchi.cleanliness +
              (item.effects?.cleanliness ?? 0) * quantity,
          ),
          lastCleanedAt: new Date(),
        };
        break;
      case "boost":
        data = {
          energy: Math.min(
            RARITY_STATS[pixegotchi.rarity].maxStat,
            pixegotchi.energy + (item.effects?.energy ?? 0) * quantity,
          ),
          lastBoostedAt: new Date(),
        };
        break;
    }

    return await prisma.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data,
    });
  }

  async addExp(userId: number, exp: number) {
    const pixegotchi = await this.findActive(userId);
    if (!pixegotchi) throw new Error("Not active pixegotchi");

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
