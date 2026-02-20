import { prisma } from "@/database/prisma";
import { Inventory } from "../inventory/inventory.service";
import { Item, Pixegotchi } from "generated/prisma/client";

export class PixegotchiService {
  private inventory = new Inventory();

  async findByUserId(userId: number) {
    return await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActive(userId: number) {
    const active = await prisma.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });
    return active ?? null;
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

  private async validateItemUsage(
    pixegotchi: Pixegotchi,
    item: Item,
    quantity: number,
  ) {
    // Перевірка рівня
    if (item.minLevel && pixegotchi.level < item.minLevel) {
      throw new Error(
        `Pixegotchi must be level ${item.minLevel} to use this item`,
      );
    }

    // Перевірка кулдауну
    if (item.cooldownMinutes) {
      await this.checkCooldown(
        pixegotchi.userId,
        pixegotchi.id,
        item.itemId,
        item.cooldownMinutes,
      );
    }

    // Перевірка ліміту на день
    if (item.maxPerDay) {
      await this.checkDailyLimit(
        pixegotchi.userId,
        pixegotchi.id,
        item.itemId,
        item.maxPerDay,
      );
    }
  }

  private async checkCooldown(
    userId: number,
    pixegotchiId: number,
    itemId: string,
    cooldownMinutes: number,
  ) {
    const lastUsage = await prisma.itemUsageHistory.findFirst({
      where: { userId, pixegotchiId, itemId },
      orderBy: { usedAt: "desc" },
    });

    if (lastUsage) {
      const minutesSinceUse =
        (Date.now() - lastUsage.usedAt.getTime()) / (1000 * 60);

      if (minutesSinceUse < cooldownMinutes) {
        const remaining = Math.ceil(cooldownMinutes - minutesSinceUse);
        throw new Error(
          `Item is on cooldown. Available in ${remaining} minutes`,
        );
      }
    }
  }

  private async checkDailyLimit(
    userId: number,
    pixegotchiId: number,
    itemId: string,
    maxPerDay: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageToday = await prisma.itemUsageHistory.aggregate({
      where: {
        userId,
        pixegotchiId,
        itemId,
        usedAt: { gte: today },
      },
      _sum: { quantity: true },
    });

    const usedToday = usageToday._sum.quantity || 0;

    if (usedToday >= maxPerDay) {
      throw new Error(`Daily limit reached for this item (${maxPerDay}/day)`);
    }
  }

  private updateActionTimestamp(updates: any, itemType: string) {
    const timestampMap: Record<string, string> = {
      food: "lastFedAt",
      medicine: "lastHealedAt",
      cleaning: "lastCleanedAt",
      toy: "lastPlayedAt",
    };

    const field = timestampMap[itemType];
    if (field) {
      updates[field] = new Date();
    }
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

  private getHoursSince(date: Date) {
    return (Date.now() - date.getTime()) / (1000 * 60 * 60);
  }
}
