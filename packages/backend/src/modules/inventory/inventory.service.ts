import { prisma } from "@/database/prisma";
import { ItemType } from "@prisma/client";

export class Inventory {
  async getUserById(userId: number) {
    return await prisma.inventory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async addItem(
    userId: number,
    itemId: string,
    itemType: ItemType,
    quantity: number = 1,
  ) {
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
        itemType,
        quantity,
      },
    });
  }

  async useItem(userId: number, itemId: string, quantity: number = 1) {
    const item = await prisma.inventory.findUnique({
      where: {
        userId_itemId: { userId, itemId },
      },
    });

    if (!item || item.quantity < quantity) {
      throw new Error("Insufficient item quantity");
    }

    if (item.quantity === quantity) {
      return await prisma.inventory.delete({
        where: { id: item.id },
      });
    }

    return await prisma.inventory.update({
      where: { id: item.id },
      data: {
        quantity: { decrement: quantity },
      },
    });
  }
}
