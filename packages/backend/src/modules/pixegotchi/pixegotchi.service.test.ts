import { describe, expect, it } from "vitest";
import { PixegotchiService } from "./pixegotchi.service";
import { createPixegotchi, createUser } from "@/test/helpers/factories";
import { CRITICAL_TIME, ItemType, RarityType } from "@pixegotchi/shared";
import { prisma } from "@/database/prisma";

describe("PixegotchiService", () => {
  const happinessItem = (
    itemType: typeof ItemType.food | typeof ItemType.toy,
  ) => ({
    itemId: itemType === ItemType.food ? "test_food" : "test_toy",
    name: "Trait test item",
    description: null,
    itemType,
    rarity: RarityType.common,
    effects: {
      hunger: 0,
      happiness: 10,
      health: 0,
      cleanliness: 0,
      energy: 0,
      buffs: [],
    },
    cooldownMinutes: null,
    maxPerDay: null,
    minLevel: 1,
    iconUrl: null,
    isStackable: true,
    maxStack: 99,
  });

  it("applies item stats without exceeding rarity max", async () => {
    const user = await createUser();
    await createPixegotchi(user.id, { hunger: 95 });
    const service = new PixegotchiService();

    const updated = await service.applyStats(user.id, {
      itemId: "apple",
      name: "Apple",
      description: null,
      itemType: ItemType.food,
      rarity: RarityType.common,
      effects: {
        hunger: 20,
        happiness: 0,
        health: 0,
        cleanliness: 0,
        energy: 0,
        buffs: [],
      },
      cooldownMinutes: null,
      maxPerDay: null,
      minLevel: 1,
      iconUrl: null,
      isStackable: true,
      maxStack: 99,
    });

    expect(updated.hunger).toBe(100);
  });

  it("applies food and play happiness trait modifiers", async () => {
    const foodUser = await createUser();
    await createPixegotchi(foodUser.id, {
      happiness: 50,
      traits: ["glutton"],
    });
    const playUser = await createUser();
    await createPixegotchi(playUser.id, {
      happiness: 50,
      traits: ["playful"],
    });
    const service = new PixegotchiService();

    const afterFood = await service.applyStats(
      foodUser.id,
      happinessItem(ItemType.food),
    );
    const afterPlay = await service.applyStats(
      playUser.id,
      happinessItem(ItemType.toy),
    );

    expect(afterFood.happiness).toBe(62);
    expect(afterPlay.happiness).toBe(63);
  });

  it("keeps immortal soul at one health after negative item effects", async () => {
    const user = await createUser();
    await createPixegotchi(user.id, {
      health: 10,
      traits: ["immortal_soul"],
    });
    const service = new PixegotchiService();
    const item = happinessItem(ItemType.food);

    const updated = await service.applyStats(user.id, {
      ...item,
      effects: {
        ...item.effects,
        happiness: 0,
        health: -100,
      },
    });

    expect(updated.health).toBe(1);
    expect(updated.status).toBe("active");
  });

  it("adds exp and increments level when exp crosses max", async () => {
    const user = await createUser();
    await createPixegotchi(user.id, { experience: 950, level: 1 });
    const service = new PixegotchiService();

    const updated = await service.addItemExp(user.id, {
      itemId: "rare_candy",
      name: "Rare Candy",
      description: null,
      itemType: ItemType.special,
      rarity: RarityType.common,
      effects: null,
      cooldownMinutes: null,
      maxPerDay: null,
      minLevel: 1,
      iconUrl: null,
      isStackable: true,
      maxStack: 99,
    });

    expect(updated.level).toBe(11);
    expect(updated.experience).toBe(950);
  });

  it("caps level and experience when exp crosses max level", async () => {
    const user = await createUser();
    await createPixegotchi(user.id, { experience: 950, level: 99 });
    const service = new PixegotchiService();

    const updated = await service.addItemExp(user.id, {
      itemId: "rare_candy",
      name: "Rare Candy",
      description: null,
      itemType: ItemType.special,
      rarity: RarityType.common,
      effects: null,
      cooldownMinutes: null,
      maxPerDay: null,
      minLevel: 1,
      iconUrl: null,
      isStackable: true,
      maxStack: 99,
    });

    expect(updated.level).toBe(100);
    expect(updated.experience).toBe(1000);
  });

  it("returns null status when the user has no active pixegotchi", async () => {
    const user = await createUser();
    const service = new PixegotchiService();

    await expect(service.checkStatus(user.id)).resolves.toBeNull();
  });

  it("starts the health zero timer while staying active", async () => {
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, {
      status: "active",
      health: 0,
      healthZeroAt: null,
      criticalSince: null,
    });
    const service = new PixegotchiService();

    const current = await service.findCurrent(user.id);

    expect(current).toMatchObject({
      id: pixegotchi.id,
      status: "active",
      health: 0,
    });

    const persisted = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });

    expect(persisted.status).toBe("active");
    expect(Number(persisted.health)).toBe(0);
    expect(persisted.healthZeroAt).toBeInstanceOf(Date);
    expect(persisted.criticalSince).toBeNull();
  });

  it("persists critical status after the health zero timer expires", async () => {
    const user = await createUser();
    const healthZeroAt = new Date(Date.now() - CRITICAL_TIME - 1_000);
    const pixegotchi = await createPixegotchi(user.id, {
      status: "active",
      health: 0,
      healthZeroAt,
      criticalSince: null,
    });
    const service = new PixegotchiService();

    const current = await service.findCurrent(user.id);

    expect(current).toMatchObject({
      id: pixegotchi.id,
      status: "critical",
      health: 0,
    });

    const persisted = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });

    expect(persisted.status).toBe("critical");
    expect(persisted.healthZeroAt?.getTime()).toBe(healthZeroAt.getTime());
    expect(persisted.criticalSince?.getTime()).toBe(
      healthZeroAt.getTime() + CRITICAL_TIME,
    );
  });

  it("returns null-safe status diffs for an active pixegotchi", async () => {
    const user = await createUser();
    await createPixegotchi(user.id, {
      lastFedAt: null,
      lastHealedAt: null,
      lastCleanedAt: null,
      lastPlayedAt: null,
      lastBoostedAt: null,
    });
    const service = new PixegotchiService();

    await expect(service.checkStatus(user.id)).resolves.toMatchObject({
      lastFedDiffMs: null,
      lastHealedDiffMs: null,
      lastCleanedDiffMs: null,
      lastPlayedDiffMs: null,
      lastBoostedDiffMs: null,
    });
  });
});
