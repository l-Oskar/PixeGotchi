import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "@/database/prisma";
import { Inventory } from "./inventory.service";
import {
  createChest,
  createItem,
  createPixegotchi,
  createUser,
} from "@/test/helpers/factories";
import { ChestGenerator } from "@/utils/chest-generator";
import {
  ChestType,
  ItemBuffsType,
  ItemType,
  RarityType,
} from "@pixegotchi/shared";

describe("Inventory", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("revives a current dead pixegotchi with a revive item", async () => {
    const user = await createUser();
    await createItem({
      itemId: "revive_stone",
      itemType: ItemType.special,
      effects: {
        hunger: 0,
        happiness: 0,
        health: 0,
        cleanliness: 0,
        energy: 0,
        buffs: [{ [ItemBuffsType.REVIVE]: 1 }],
      },
      maxPerDay: 1,
      isStackable: false,
    });
    await createPixegotchi(user.id, {
      status: "dead",
      health: 0,
      healthZeroAt: new Date(),
      criticalSince: new Date(),
    });
    const inventory = new Inventory();

    await inventory.addItem(user.id, "revive_stone", 1);
    const pixegotchi = await inventory.useItem(user.id, "revive_stone", 1);

    expect(pixegotchi).toMatchObject({
      status: "active",
      health: 50,
      healthZeroAt: null,
      criticalSince: null,
    });
    await expect(
      prisma.inventory.findUnique({
        where: { userId_itemId: { userId: user.id, itemId: "revive_stone" } },
      }),
    ).resolves.toBeNull();
    await expect(
      prisma.itemUsageHistory.count({
        where: { userId: user.id, itemId: "revive_stone", quantity: 1 },
      }),
    ).resolves.toBe(1);
  });

  it("does not consume a normal item for a current dead pixegotchi", async () => {
    const user = await createUser();
    await createItem({ itemId: "apple" });
    await createPixegotchi(user.id, { status: "dead", health: 0 });
    const inventory = new Inventory();

    await inventory.addItem(user.id, "apple", 1);

    await expect(inventory.useItem(user.id, "apple", 1)).rejects.toThrow(
      "Pixegotchi is not active",
    );
    await expect(
      prisma.inventory.findUnique({
        where: { userId_itemId: { userId: user.id, itemId: "apple" } },
      }),
    ).resolves.toMatchObject({ quantity: 1 });
  });

  it("opens a chest, stores rewards, adds items, and creates an egg reward", async () => {
    const user = await createUser();
    await createChest(user.id, { chestType: ChestType.golden });
    await createItem({ itemId: "apple" });
    const inventory = new Inventory();

    vi.spyOn(ChestGenerator, "openChest").mockReturnValue({
      items: [
        {
          itemId: "apple",
          type: ItemType.food,
          quantity: 2,
          rarity: RarityType.common,
        },
      ],
      egg: true,
      totalValue: 0,
    });

    const rewards = await inventory.openChest(user.id, ChestType.golden);
    const openedChest = await prisma.chest.findFirstOrThrow({
      where: { userId: user.id, chestType: ChestType.golden },
    });

    expect(rewards.egg).toBe(true);
    expect(openedChest.isOpened).toBe(true);
    expect(openedChest.rewards).toMatchObject({
      egg: true,
      items: [{ itemId: "apple", quantity: 2 }],
    });
    await expect(
      prisma.inventory.findUnique({
        where: { userId_itemId: { userId: user.id, itemId: "apple" } },
      }),
    ).resolves.toMatchObject({ quantity: 2 });
    await expect(prisma.egg.count({ where: { userId: user.id } })).resolves.toBe(
      1,
    );
  });
});
