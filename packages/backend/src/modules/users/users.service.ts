import { prisma } from "@/database/prisma";
import { USER_CONST } from "@pixegotchi/shared";

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
        pgcBalance: USER_CONST.START_BALANCE,
      },
    });
  }

  async findOrCreate(data: { telegramId: number; username?: string }) {
    return await prisma.user.upsert({
      where: { telegramId: data.telegramId },
      update: {
        username: data.username,
      },
      create: {
        telegramId: data.telegramId,
        username: data.username,
        pgcBalance: USER_CONST.START_BALANCE,
      },
    });
  }

  async updatePGCBalance(userId: number, amount: number) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        pgcBalance: {
          increment: amount,
        },
      },
    });

    return { ...user, telegramId: user.telegramId.toString() };
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return null;
    }

    return { ...user, telegramId: user.telegramId.toString() };
  }
}
