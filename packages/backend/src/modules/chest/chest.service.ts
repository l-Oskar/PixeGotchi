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
    return chest;
  }
}
