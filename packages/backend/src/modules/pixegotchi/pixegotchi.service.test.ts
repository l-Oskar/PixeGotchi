import { describe, expect, it } from "vitest";
import { PixegotchiService } from "./pixegotchi.service";
import { createPixegotchi, createUser } from "@/test/helpers/factories";
import { ItemType, RarityType } from "@pixegotchi/shared";

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

    const updated = await service.addExp(user.id, {
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
