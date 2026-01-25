import { prisma } from "../../database/prisma";
import { Prisma } from "@prisma/client";

export class UserService {
  async findByTelegramId(telegramId: number) {
    return await prisma.user.findUnique({
      where: {
        telegramId: BigInt(telegramId),
      },
    });
  }

  async create(data: { telegramId: number; username?: string }) {
    return await prisma.user.create({
      data: {
        telegramId: BigInt(data.telegramId),
        username: data.username,
      },
    });
  }

  async findOrCreate(telegramId: number, username?: string) {
    const user = await this.findByTelegramId(telegramId);
    if (user) return user;
    return await this.create({ telegramId, username });
  }

  async updatePGCValance(userId: number, amount: number) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        pgcBalance: {
          increment: amount,
        },
      },
    });
  }

  async getProfile(userId: number) {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        pixegotchis: {
          where: {
            status: "active",
          },
        },
        inventory: true,
        vault: {
          include: {
            pixegotchi: true,
          },
        },
      },
    });
  }
}
