import { prisma } from "@/database/prisma";
import { Pixegotchi, ItemType, RarityType } from "@shared";

export class ItemsService {
  async getItemDetails(itemId: string) {
    const itemDetails = await prisma.item.findUnique({
      where: {
        itemId,
      },
    });

    if (!itemDetails) throw new Error(`No item with ID: ${itemId}`);

    return itemDetails;
  }

  async getAllItems() {
    return await prisma.item.findMany({
      where: {},
    });
  }

  async getItemsByType(itemType: ItemType) {
    if (!Object.values(ItemType).includes(itemType))
      throw new Error(`Invalid item type: ${itemType}`);

    return await prisma.item.findMany({
      where: {
        itemType,
      },
    });
  }

  async getItemsByRarity(rarityType: RarityType) {
    if (!Object.values(RarityType).includes(rarityType))
      throw new Error(`Invalid rarity: ${rarityType}`);
    return await prisma.item.findMany({
      where: {
        rarity: rarityType,
      },
    });
  }
}
