import { describe, expect, it } from "vitest";
import { PixegotchiService } from "./pixegotchi.service";
import { createPixegotchi, createUser } from "@/test/helpers/factories";
import { CRITICAL_TIME, ItemType, RarityType } from "@pixegotchi/shared";
import { prisma } from "@/database/prisma";

describe("PixegotchiService", () => {
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
