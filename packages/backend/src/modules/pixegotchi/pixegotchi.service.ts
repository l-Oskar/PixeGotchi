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

    await this.addExp(userId, ITEM_EXP);

    return await prisma.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data: {
        health: Math.min(
          RARITY_STATS[pixegotchi.rarity].maxStat,
          pixegotchi.health + (item.effects?.health ?? 0) * quantity,
        ),
        hunger: Math.min(
          RARITY_STATS[pixegotchi.rarity].maxStat,
          pixegotchi.hunger + (item.effects?.hunger ?? 0) * quantity,
        ),
        energy: Math.min(
          RARITY_STATS[pixegotchi.rarity].maxStat,
          pixegotchi.energy + (item.effects?.energy ?? 0) * quantity,
        ),
        cleanliness: Math.min(
          RARITY_STATS[pixegotchi.rarity].maxStat,
          pixegotchi.cleanliness + (item.effects?.cleanliness ?? 0) * quantity,
        ),
        happiness: Math.min(
          RARITY_STATS[pixegotchi.rarity].maxStat,
          pixegotchi.happiness + (item.effects?.happiness ?? 0) * quantity,
        ),
        lastUpdateAt: new Date(),
        // health: { increment: (item.effects?.hunger ?? 0) * quantity },
        // hunger: { increment: (item.effects?.hunger ?? 0) * quantity },
        // energy: { increment: (item.effects?.energy ?? 0) * quantity },
        // cleanliness: { increment: (item.effects?.cleanliness ?? 0) * quantity },
        // happiness: { increment: (item.effects?.happiness ?? 0) * quantity },
      },
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

    return await prisma.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data: {
        experience: pixegotchi.experience + exp - MAX_EXP,
        level: { increment: 1 },
      },
    });
  }
}
