import { prisma } from "@/database/prisma";
import type { Pixegotchi, Item } from "@shared";
import { ItemType, RarityType, parseItem } from "@shared";

export class ItemsService {
  async getItemDetails(itemId: string) {
    const itemDetails = await prisma.item.findUnique({
      where: {
        itemId,
      },
    });

    if (!itemDetails) throw new Error(`No item with ID: ${itemId}`);

    return parseItem(itemDetails);
  }

  async getAllItems() {
    return await prisma.item.findMany({
      where: {},
    });
  }

  async getItemsByType(itemType: ItemType) {
    if (!Object.values(ItemType).includes(itemType))
      throw new Error(`Invalid item type: ${itemType}`);

    return await prisma.item.findMany({
      where: {
        itemType,
      },
    });
  }

  async getItemsByRarity(rarityType: RarityType) {
    if (!Object.values(RarityType).includes(rarityType))
      throw new Error(`Invalid rarity: ${rarityType}`);
    return await prisma.item.findMany({
      where: {
        rarity: rarityType,
      },
    });
  }

  async validateItemUsage(pixegotchi: Pixegotchi, item: Item) {
    // Перевірка рівня
    try {
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
    } catch (error) {
      return error;
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
      const minutesSinceUse = this.getMinutesSince(lastUsage.usedAt);

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

  private getMinutesSince(date: Date) {
    return (Date.now() - date.getTime()) / (1000 * 60);
  }
}
