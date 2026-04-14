import { prisma } from "@/database/prisma";
import { ChestGenerator } from "@/utils/chest-generator";
import { ChestType } from "@shared";

export class ChestService {
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
}
