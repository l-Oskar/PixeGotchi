import { prisma } from "@/database/prisma";
import { bigintToString } from "@/utils/convert";

export class UsersService {
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

  async updatePGCBalance(userId: number, amount: number) {
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

    return user ? bigintToString(user) : null;
  }
}
