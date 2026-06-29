import { describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import { Inventory } from "./inventory.service";
import {
  createItem,
  createPixegotchi,
  createUser,
} from "@/test/helpers/factories";

describe("Inventory", () => {
  it("adds a new item and increments an existing inventory row", async () => {
    const user = await createUser();
    await createItem({ itemId: "apple" });
    const inventory = new Inventory();

    await inventory.addItem(user.id, "apple", 2);
    const updated = await inventory.addItem(user.id, "apple", 3);

    expect(updated.quantity).toBe(5);
    await expect(
      prisma.inventory.count({ where: { userId: user.id, itemId: "apple" } }),
    ).resolves.toBe(1);
  });

  it("consumes items and deletes the row on exact quantity", async () => {
    const user = await createUser();
    await createItem({ itemId: "apple" });
    const inventory = new Inventory();

    await inventory.addItem(user.id, "apple", 2);
    await inventory.consumeItem(user.id, "apple", 1);

    const remaining = await prisma.inventory.findUniqueOrThrow({
      where: { userId_itemId: { userId: user.id, itemId: "apple" } },
    });
    expect(remaining.quantity).toBe(1);

    await inventory.consumeItem(user.id, "apple", 1);
    await expect(
      prisma.inventory.findUnique({
        where: { userId_itemId: { userId: user.id, itemId: "apple" } },
      }),
    ).resolves.toBeNull();
  });

  it("rejects insufficient quantity", async () => {
    const user = await createUser();
    await createItem({ itemId: "apple" });
    const inventory = new Inventory();

    await inventory.addItem(user.id, "apple", 1);

    await expect(inventory.consumeItem(user.id, "apple", 2)).rejects.toThrow(
      "Insufficient item quantity",
    );
  });

  it("uses an item, applies stats, consumes inventory, and writes history", async () => {
    const user = await createUser();
    await createItem({
      itemId: "apple",
      effects: {
        hunger: 15,
        happiness: 0,
        health: 0,
        cleanliness: 0,
        energy: 0,
        buffs: [],
      },
    });
    await createPixegotchi(user.id, { hunger: 70 });
    const inventory = new Inventory();

    await inventory.addItem(user.id, "apple", 2);
    const pixegotchi = await inventory.useItem(user.id, "apple", 1);

    expect(pixegotchi.hunger).toBe(85);
    await expect(
      prisma.inventory.findUnique({
        where: { userId_itemId: { userId: user.id, itemId: "apple" } },
      }),
    ).resolves.toMatchObject({ quantity: 1 });
    await expect(
      prisma.itemUsageHistory.count({
        where: { userId: user.id, itemId: "apple", quantity: 1 },
      }),
    ).resolves.toBe(1);
  });
});
