import { describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import { ItemsService } from "./items.service";
import {
  createItem,
  createPixegotchi,
  createUser,
} from "@/test/helpers/factories";
import { ItemType, RarityType } from "@pixegotchi/shared";

describe("ItemsService", () => {
  it("returns parsed item details", async () => {
    await createItem({
      itemId: "apple",
      effects: {
        hunger: "12",
        happiness: 0,
        health: 0,
        cleanliness: 0,
        energy: 0,
        buffs: [],
      },
    });
    const service = new ItemsService();

    const item = await service.getItemDetails("apple");

    expect(item).toMatchObject({
      itemId: "apple",
      itemType: ItemType.food,
      rarity: RarityType.common,
      effects: {
        hunger: 12,
      },
    });
    expect(item.createdAt).toEqual(expect.any(String));
    expect(item.updatedAt).toEqual(expect.any(String));
  });

  it("rejects item usage below the minimum level", async () => {
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { level: 2 });
    await createItem({
      itemId: "level_food",
      minLevel: 3,
    });
    const service = new ItemsService();
    const item = await service.getItemDetails("level_food");

    await expect(service.validateItemUsage(pixegotchi, item)).rejects.toThrow(
      "Pixegotchi must be level 3",
    );
  });

  it("rejects item usage during cooldown", async () => {
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id);
    await createItem({
      itemId: "cooldown_food",
      cooldownMinutes: 10,
    });
    await prisma.itemUsageHistory.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        itemId: "cooldown_food",
        quantity: 1,
        usedAt: new Date(),
      },
    });
    const service = new ItemsService();
    const item = await service.getItemDetails("cooldown_food");

    await expect(service.validateItemUsage(pixegotchi, item)).rejects.toThrow(
      "Item is on cooldown",
    );
  });

  it("rejects item usage over the daily limit", async () => {
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id);
    await createItem({
      itemId: "limited_food",
      maxPerDay: 2,
    });
    await prisma.itemUsageHistory.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        itemId: "limited_food",
        quantity: 2,
        usedAt: new Date(),
      },
    });
    const service = new ItemsService();
    const item = await service.getItemDetails("limited_food");

    await expect(
      service.validateItemUsage(pixegotchi, item, 1),
    ).rejects.toThrow("Daily limit reached");
  });

  it("filters items by type and rarity", async () => {
    await createItem({
      itemId: "apple",
      itemType: ItemType.food,
      rarity: RarityType.common,
    });
    await createItem({
      itemId: "bandage",
      itemType: ItemType.medicine,
      rarity: RarityType.rare,
    });
    const service = new ItemsService();

    await expect(service.getItemsByType(ItemType.food)).resolves.toHaveLength(1);
    await expect(service.getItemsByRarity(RarityType.rare)).resolves.toHaveLength(
      1,
    );
  });
});
