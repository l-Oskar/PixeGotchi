import { prisma } from "@/database/prisma";
import { Inventory } from "../inventory/inventory.service";
import { ChestGenerator } from "@/utils/chest-generator";
import { ChestType, EGG_CONSTANTS } from "@shared";

export class ChestService {
  private inventory = new Inventory();

  async getAllChests(userId: number) {
    return await prisma.chest.findMany({
      where: {
        userId,
        isOpened: false,
      },
    });
  }

  async getRandomChest(userId: number) {
    const randomChest = ChestGenerator.generateRandomChest();
    return await prisma.chest.create({
      data: {
        userId,
        chestType: randomChest.chestType as ChestType as any,
      },
    });
  }

  async openChest(userId: number, chestId: number) {
    const chest = await prisma.chest.findFirst({
      where: {
        userId,
        id: chestId,
        isOpened: false,
      },
    });

    if (!chest) throw new Error("Chest no found");

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
      async (item) =>
        await this.inventory.addItem(userId, item.itemId, item.quantity),
    );
  }
}
