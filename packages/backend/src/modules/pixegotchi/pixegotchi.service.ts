import { prisma } from "@/database/prisma";
import { Item } from "@shared";

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

    return await prisma.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data: {
        health: { increment: (item.effects?.hunger ?? 0) * quantity },
        hunger: { increment: (item.effects?.hunger ?? 0) * quantity },
        energy: { increment: (item.effects?.energy ?? 0) * quantity },
        cleanliness: { increment: (item.effects?.cleanliness ?? 0) * quantity },
        happiness: { increment: (item.effects?.happiness ?? 0) * quantity },
        lastUpdateAt: new Date(),
      },
    });
  }
}
