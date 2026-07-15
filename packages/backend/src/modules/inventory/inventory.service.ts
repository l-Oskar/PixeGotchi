import { prisma } from "@/database/prisma";
import {
  ITEMS_BY_ID,
  InventoryWithDetails,
  EGG_CONSTANTS,
  ChestType,
  ChestRewardCosmetic,
  Item,
  ItemBuffsType,
} from "@pixegotchi/shared";
import { ItemsService } from "../items/items.service";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";
import { ChestService } from "../chest/chest.service";
import { ChestGenerator } from "@/utils/chest-generator";
import type {
  Inventory as PrismaInventory,
  Prisma,
} from "@/generated/prisma/client";

type PrismaExecutor = typeof prisma | Prisma.TransactionClient;

const COSMETIC_DROP_CHANCE: Record<ChestType, number> = {
  [ChestType.wooden]: 0,
  [ChestType.silver]: 0,
  [ChestType.golden]: 0.02,
  [ChestType.crystal]: 0.04,
  [ChestType.mythic]: 0.07,
  [ChestType.legendary]: 0.1,
};

function hasReviveEffect(item: Item) {
  return item.effects?.buffs?.some((buff) => buff[ItemBuffsType.REVIVE]);
}

function getEffectiveUseQuantity(item: Item, requestedQuantity: number) {
  return item.cooldownMinutes && item.cooldownMinutes > 0
    ? 1
    : requestedQuantity;
}

function getCooldownRemainingMinutes(lastUsedAt: Date, cooldownMinutes: number) {
  const minutesSinceUse = (Date.now() - lastUsedAt.getTime()) / (1000 * 60);
  return Math.max(0, Math.ceil(cooldownMinutes - minutesSinceUse));
}

export class Inventory {
  constructor(private readonly rng: () => number = Math.random) {}

  private async awardChestCosmetic(
    userId: number,
    chestType: ChestType,
    transaction: Prisma.TransactionClient,
  ): Promise<ChestRewardCosmetic | null> {
    if (this.rng() >= COSMETIC_DROP_CHANCE[chestType]) return null;

    const eligibleAssets = await transaction.cosmeticAsset.findMany({
      where: {
        isActive: true,
        isDefault: false,
        isLimited: false,
        isChestReward: true,
        chestDropWeight: { gt: 0 },
        ownerships: {
          none: { userId, quantity: { gt: 0 } },
        },
      },
      orderBy: { id: "asc" },
    });
    if (eligibleAssets.length === 0) return null;

    const totalWeight = eligibleAssets.reduce(
      (total, asset) => total + asset.chestDropWeight,
      0,
    );
    let roll = this.rng() * totalWeight;
    const selectedAsset =
      eligibleAssets.find((asset) => {
        roll -= asset.chestDropWeight;
        return roll < 0;
      }) ?? eligibleAssets[eligibleAssets.length - 1]!;

    const ownership = await transaction.userCosmetic.createMany({
      data: {
        userId,
        cosmeticAssetId: selectedAsset.id,
        quantity: 1,
      },
      skipDuplicates: true,
    });
    if (ownership.count !== 1) return null;

    return {
      cosmeticAssetId: selectedAsset.id,
      name: selectedAsset.name,
      rarity: selectedAsset.rarity,
      assetUrl: selectedAsset.assetUrl,
    };
  }

  private itemService = new ItemsService();
  private chestService = new ChestService();
  private pixegotchiService = new PixegotchiService();

  async getInventory(userId: number) {
    return await prisma.inventory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getInventoryWithDetails(
    userId: number,
  ): Promise<InventoryWithDetails[]> {
    const inventory: PrismaInventory[] = await prisma.inventory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const currentPixegotchi = await this.pixegotchiService.findCurrent(userId);
    const itemIds = inventory.map((item) => item.itemId);
    const lastUsages =
      currentPixegotchi && itemIds.length > 0
        ? await prisma.itemUsageHistory.findMany({
            where: {
              userId,
              pixegotchiId: currentPixegotchi.id,
              itemId: { in: itemIds },
            },
            orderBy: { usedAt: "desc" },
          })
        : [];
    const lastUsageByItemId = new Map<string, (typeof lastUsages)[number]>();

    for (const usage of lastUsages) {
      if (!lastUsageByItemId.has(usage.itemId)) {
        lastUsageByItemId.set(usage.itemId, usage);
      }
    }

    const inventoryWithDetails = await Promise.all(
      inventory.map(async (item) => {
        try {
          const details = await this.itemService.getItemDetails(item.itemId);
          const lastUsage = lastUsageByItemId.get(item.itemId);
          const cooldownRemainingMinutes =
            details.cooldownMinutes && lastUsage
              ? getCooldownRemainingMinutes(
                  lastUsage.usedAt,
                  details.cooldownMinutes,
                )
              : 0;

          return { ...item, details, cooldownRemainingMinutes };
        } catch {
          return { ...item, details: null, cooldownRemainingMinutes: 0 };
        }
      }),
    );

    return inventoryWithDetails;
  }

  async getChestWithDetails(userId: number) {
    const chests = await this.chestService.getSortedChests(userId);

    return chests;
  }

  async addItem(
    userId: number,
    itemId: keyof typeof ITEMS_BY_ID,
    quantity: number = 1,
    db: PrismaExecutor = prisma,
  ) {
    const item = await db.item.findFirst({
      where: {
        itemId,
      },
    });

    if (!item) throw new Error(`Item ${itemId} not found`);

    const existing = await db.inventory.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });

    if (existing) {
      return await db.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: { increment: quantity },
        },
      });
    }

    return await db.inventory.create({
      data: {
        userId,
        itemId,
        rarity: item.rarity,
        itemType: item.itemType,
        quantity,
      },
    });
  }

  async consumeItem(
    userId: number,
    itemId: string,
    quantity: number = 1,
    db: PrismaExecutor = prisma,
  ) {
    const item = await db.inventory.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });

    if (!item || item.quantity < quantity) {
      throw new Error("Insufficient item quantity");
    }

    if (item.quantity === quantity) {
      await db.inventory.delete({
        where: { id: item.id },
      });
    } else {
      await db.inventory.update({
        where: { id: item.id },
        data: {
          quantity: { decrement: quantity },
        },
      });
    }
    return item;
  }

  async useItem(userId: number, itemId: string, quantity?: number) {
    const requestedQuantity = quantity ?? 1;
    const pixegotchi = await this.pixegotchiService.findCurrent(userId);

    if (!pixegotchi) throw new Error("No active pixegotchi");

    const item = await this.itemService.getItemDetails(itemId);
    const quantityToUse = getEffectiveUseQuantity(item, requestedQuantity);
    const isReviveItem = hasReviveEffect(item);

    if (pixegotchi.status !== "active" && !isReviveItem)
      throw new Error("Pixegotchi is not active");

    if (pixegotchi.status === "active" && isReviveItem)
      throw new Error("Pixegotchi is already active");

    await this.itemService.validateItemUsage(pixegotchi, item, quantityToUse);

    if (isReviveItem) {
      return await prisma.$transaction(async (tx) => {
        await this.consumeItem(userId, itemId, quantityToUse, tx);

        const updatedPixegotchi = await tx.pixegotchi.update({
          where: { id: pixegotchi.id },
          data: {
            status: "active",
            health: 50,
            healthZeroAt: null,
            criticalSince: null,
            lastHealedAt: new Date(),
            lastUpdateAt: new Date(),
          },
        });

        await tx.itemUsageHistory.create({
          data: {
            userId,
            pixegotchiId: pixegotchi.id,
            itemId,
            quantity: quantityToUse,
          },
        });

        return updatedPixegotchi;
      });
    }

    return await prisma.$transaction(async (tx) => {
      await this.consumeItem(userId, itemId, quantityToUse, tx);
      const updatedPixegotchi = await this.pixegotchiService.applyStats(
        userId,
        item,
        quantityToUse,
        tx,
      );

      await tx.itemUsageHistory.create({
        data: {
          userId,
          pixegotchiId: pixegotchi.id,
          itemId,
          quantity: quantityToUse,
        },
      });

      return updatedPixegotchi;
    });
  }

  async openChest(userId: number, chestType: ChestType) {
    const chest = await prisma.chest.findFirst({
      where: {
        userId,
        chestType: chestType,
        isOpened: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    if (!chest) throw new Error("Chest no found");

    return await prisma.$transaction(async (prisma) => {
      const rewards = ChestGenerator.openChest(chest.chestType);
      rewards.cosmetic = await this.awardChestCosmetic(
        userId,
        chest.chestType,
        prisma,
      );

      if (rewards.egg) {
        await prisma.egg.create({
          data: {
            userId,
            createdAt: new Date(),
            hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
          },
        });
      }

      for (const item of rewards.items) {
        await this.addItem(userId, item.itemId, item.quantity, prisma);
      }

      await prisma.chest.update({
        where: {
          id: chest.id,
        },
        data: {
          isOpened: true,
          openedAt: new Date(),
          rewards: {
            items: rewards.items,
            egg: rewards.egg,
            cosmetic: rewards.cosmetic,
          } as any,
        },
      });

      return rewards;
    });
  }
}
