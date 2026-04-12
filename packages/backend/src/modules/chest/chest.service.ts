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
        chestType: randomChest.chestType,
      },
    });
  }

  async getSpecificChest(userId: number, chestType: ChestType) {
    const specificChest = ChestGenerator.generateSpecificChest(chestType);

    return await prisma.chest.create({
      data: {
        userId,
        chestType: specificChest.chestType,
      },
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
    return rewards;
  }
}
