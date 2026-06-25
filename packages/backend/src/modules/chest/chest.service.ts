import { prisma } from "@/database/prisma";
import { ChestGenerator } from "@/utils/chest-generator";
import { ChestType, ChestInventory } from "@pixegotchi/shared";
import type { Chest as PrismaChest } from "@/generated/prisma/client";

export class ChestService {
  async getAllChests(userId: number) {
    return await prisma.chest.findMany({
      where: {
        userId,
        isOpened: false,
      },
    });
  }

  async getSortedChests(userId: number) {
    const chests: PrismaChest[] = await this.getAllChests(userId);

    const result: ChestInventory[] = Object.values(
      chests.reduce(
        (acc, { chestType }) => {
          const sharedChestType = chestType as ChestType;

          if (!acc[sharedChestType]) {
            acc[sharedChestType] = { chestType: sharedChestType, quantity: 1 };
          } else {
            acc[sharedChestType].quantity += 1;
          }

          return acc;
        },
        {} as Record<ChestType, ChestInventory>,
      ),
    );

    const sorted = [...result].sort((a, b) => {
      const order = Object.values(ChestType);
      return order.indexOf(a.chestType) - order.indexOf(b.chestType);
    });

    return sorted;
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
}
