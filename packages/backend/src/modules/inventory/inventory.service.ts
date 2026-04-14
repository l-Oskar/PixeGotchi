import { prisma } from "@/database/prisma";
import {
  ITEMS_BY_ID,
  InventoryWithDetails,
  EGG_CONSTANTS,
  ChestType,
} from "@shared";
import { ItemsService } from "../items/items.service";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";
import { ChestService } from "../chest/chest.service";
import { ChestGenerator } from "@/utils/chest-generator";

export class Inventory {
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
    const inventory = await prisma.inventory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const chests = await this.chestService.getAllChests(userId);

    const inventoryWithDetails = await Promise.all(
      inventory.map(async (item) => {
        try {
          const details = await this.itemService.getItemDetails(item.itemId);
          return { ...item, details };
        } catch {
          return { ...item, details: null };
        }
      }),
    );

    return inventoryWithDetails;
  }

  async addItem(
    userId: number,
    itemId: keyof typeof ITEMS_BY_ID,
    quantity: number = 1,
  ) {
    const item = await prisma.item.findFirst({
      where: {
        itemId,
      },
    });

    if (!item) throw new Error(`Item ${itemId} not found`);

    const existing = await prisma.inventory.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });

    if (existing) {
      return await prisma.inventory.update({
        where: { id: existing.id },
        data: {
          quantity: { increment: quantity },
        },
      });
    }

    return await prisma.inventory.create({
      data: {
        userId,
        itemId,
        itemType: item.itemType,
        quantity,
      },
    });
  }

  async consumeItem(userId: number, itemId: string, quantity: number = 1) {
    const item = await prisma.inventory.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });

    if (!item || item.quantity < quantity) {
      throw new Error("Insufficient item quantity");
    }

    if (item.quantity === quantity) {
      await prisma.inventory.delete({
        where: { id: item.id },
      });
    } else {
      await prisma.inventory.update({
        where: { id: item.id },
        data: {
          quantity: { decrement: quantity },
        },
      });
    }
    return item;
  }

  async useItem(userId: number, itemId: string, quantity?: number) {
    const pixegotchi = await this.pixegotchiService.findActive(userId);

    if (!pixegotchi) throw new Error("No active pixegotchi");

    const item = await this.itemService.getItemDetails(itemId);

    const valid = this.itemService.validateItemUsage(pixegotchi, item);

    if (!valid) throw new Error("You can't use this item now!");

    if (item.itemType === "food" || "medicine" || "toy" || "cleaning") {
      await this.pixegotchiService.applyStats(userId, item, quantity);
    }
    return await this.consumeItem(userId, itemId, quantity);
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

      if (rewards.egg) {
        await prisma.egg.create({
          data: {
            userId,
            createdAt: new Date(),
            hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
          },
        });
      }

      rewards.items.forEach(
        async (item) => await this.addItem(userId, item.itemId, item.quantity),
      );

      await prisma.chest.update({
        where: {
          id: chest.id,
        },
        data: {
          isOpened: true,
          openedAt: new Date(),
          rewards: chest.rewards!,
        },
      });
    });
  }
}
