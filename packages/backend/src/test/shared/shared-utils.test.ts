import { describe, expect, it } from "vitest";
import {
  CRITICAL_TIME,
  DEAD_TIME,
  RarityType,
  assertValidGenomeHash,
  buildPixegotchiSnapshot,
  calculateCurrentStats,
  derivePixegotchiStatus,
  parseItem,
  parseItemEffects,
  validateGenomeHash,
} from "@pixegotchi/shared";
import {
  calculateDelta,
  percentToValue,
  valueToPercent,
} from "../../../../shared/src/utils/calculate_stats/calculate_delta";
import { getFinalExp } from "../../../../shared/src/utils/calculate_stats/calculate_exp";

describe("shared pure logic", () => {
  const basePixegotchi = {
    id: 1,
    userId: 1,
    eggId: 1,
    nftAddress: null,
    genomeHash: "1770393107839-j5pytpw3rzf-557d1f910af4e0dbf5fe4add0576b038",
    element: "fire",
    rarity: RarityType.common,
    gender: "male",
    traits: [],
    name: "Testgo",
    status: "active",
    level: 1,
    experience: 0,
    health: 100,
    hunger: 70,
    energy: 100,
    happiness: 50,
    cleanliness: 100,
    healthZeroAt: null,
    criticalSince: null,
    lastFedAt: null,
    lastPlayedAt: null,
    lastSleptAt: null,
    lastCleanedAt: null,
    lastHealedAt: null,
    lastBoostedAt: null,
    lastUpdateAt: new Date("2026-01-01T00:00:00.000Z"),
    hatchedAt: new Date("2026-01-01T00:00:00.000Z"),
  } as const;

  it("validates genome hash format", () => {
    expect(
      validateGenomeHash(
        "1770393107839-j5pytpw3rzf-557d1f910af4e0dbf5fe4add0576b038",
      ),
    ).toBe(true);
    expect(validateGenomeHash("bad-hash")).toBe(false);
    expect(() => assertValidGenomeHash("bad-hash")).toThrow(
      "Invalid genome hash format",
    );
  });

  it("normalizes item effects from raw data", () => {
    expect(
      parseItemEffects({
        hunger: "12",
        happiness: undefined,
        health: 5,
        cleanliness: null,
        energy: "bad",
        buffs: [{ type: "luck", value: 1 }],
      }),
    ).toEqual({
      hunger: 12,
      happiness: 0,
      health: 5,
      cleanliness: 0,
      energy: 0,
      buffs: [{ type: "luck", value: 1 }],
    });
    expect(parseItemEffects(null)).toBeNull();
  });

  it("serializes parsed item timestamps", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");

    expect(
      parseItem({
        itemId: "apple",
        name: "Apple",
        description: null,
        itemType: "food",
        rarity: RarityType.common,
        effects: { hunger: 10 },
        cooldownMinutes: null,
        maxPerDay: null,
        minLevel: 1,
        iconUrl: null,
        isStackable: true,
        maxStack: 99,
        createdAt,
        updatedAt,
      }),
    ).toMatchObject({
      itemId: "apple",
      effects: {
        hunger: 10,
        happiness: 0,
      },
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
  });

  it("calculates stat and exp helpers", () => {
    expect(valueToPercent(25, 100)).toBe(25);
    expect(percentToValue(12.5, 200)).toBe(25);
    expect(calculateDelta(10, 1_800_000)).toBe(5);
    expect(getFinalExp(90, 10, 2)).toBe(252);
  });

  it("calculates lazy degraded stats from lastUpdateAt", () => {
    const stats = calculateCurrentStats(
      basePixegotchi,
      new Date("2026-01-01T02:00:00.000Z"),
    );

    expect(stats.hunger).toBeLessThan(Number(basePixegotchi.hunger));
    expect(stats.cleanliness).toBeLessThan(
      Number(basePixegotchi.cleanliness),
    );
    expect(stats.happiness).toBeLessThan(Number(basePixegotchi.happiness));
    expect(stats.health).toBeGreaterThanOrEqual(0);
    expect(stats.energy).toBeGreaterThanOrEqual(0);
  });

  it("does not degrade vault or dead pixegotchis", () => {
    const now = new Date("2026-01-02T00:00:00.000Z");

    expect(
      calculateCurrentStats({ ...basePixegotchi, status: "vault" }, now),
    ).toEqual({
      health: 100,
      hunger: 70,
      energy: 100,
      happiness: 50,
      cleanliness: 100,
    });
    expect(
      calculateCurrentStats({ ...basePixegotchi, status: "dead" }, now),
    ).toEqual({
      health: 100,
      hunger: 70,
      energy: 100,
      happiness: 50,
      cleanliness: 100,
    });
  });

  it("derives critical and dead statuses from health timers", () => {
    const criticalStartedAt = new Date("2026-01-01T00:00:00.000Z");
    const stats = {
      health: 0,
      hunger: 0,
      energy: 0,
      happiness: 0,
      cleanliness: 0,
    };

    expect(
      derivePixegotchiStatus(
        {
          ...basePixegotchi,
          health: 0,
          healthZeroAt: criticalStartedAt,
          criticalSince: criticalStartedAt,
        },
        stats,
        new Date(criticalStartedAt.getTime() + CRITICAL_TIME / 2),
      ),
    ).toBe("critical");
    expect(
      derivePixegotchiStatus(
        {
          ...basePixegotchi,
          health: 0,
          healthZeroAt: criticalStartedAt,
          criticalSince: criticalStartedAt,
        },
        stats,
        new Date(criticalStartedAt.getTime() + DEAD_TIME),
      ),
    ).toBe("dead");
  });

  it("builds a computed snapshot without mutating the source object", () => {
    const snapshot = buildPixegotchiSnapshot(
      basePixegotchi,
      new Date("2026-01-01T01:00:00.000Z"),
    );

    expect(snapshot.computedAt).toBe("2026-01-01T01:00:00.000Z");
    expect(snapshot.elapsedMs).toBe(3_600_000);
    expect(snapshot.hunger).toBeLessThan(Number(basePixegotchi.hunger));
    expect(basePixegotchi.hunger).toBe(70);
  });
});
