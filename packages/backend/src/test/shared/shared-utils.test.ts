import { describe, expect, it } from "vitest";
import {
  CRITICAL_TIME,
  DEAD_TIME,
  ChestGenerator,
  RarityType,
  assertValidGenomeHash,
  buildPixegotchiSnapshot,
  calculateCurrentStats,
  derivePixegotchiStatus,
  GenomeGenerator,
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

  it("generates deterministic genomes with injected rng", () => {
    const createRng = () => {
      let seed = 12345;
      return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0x100000000;
      };
    };
    const first = GenomeGenerator.generate({
      now: new Date("2026-01-01T00:00:00.000Z"),
      rng: createRng(),
    });
    const second = GenomeGenerator.generate({
      now: new Date("2026-01-01T00:00:00.000Z"),
      rng: createRng(),
    });

    expect(second).toEqual(first);
    expect(validateGenomeHash(first.genome_hash)).toBe(true);
  });

  it("does not derive genome gender only from timestamp", () => {
    let seed = 98765;
    const rng = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0x100000000;
    };
    const genders = new Set(
      Array.from({ length: 100 }, (_, index) =>
        GenomeGenerator.generate({
          now: new Date("2026-01-01T00:00:00.000Z").getTime() + index,
          rng,
        }),
      ).map((genome) => genome.gender),
    );

    expect(genders).toEqual(new Set(["female", "male"]));
  });

  it("generates deterministic chest rewards with injected rng", () => {
    const createRng = () => {
      let seed = 24680;
      return () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 0x100000000;
      };
    };
    const first = ChestGenerator.openChest("golden", { rng: createRng() });
    const second = ChestGenerator.openChest("golden", { rng: createRng() });

    expect(second).toEqual(first);
    expect(first.items.length).toBeGreaterThanOrEqual(2);
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

  it("keeps lifecycle timers at three days per stage", () => {
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    expect(CRITICAL_TIME).toBe(threeDaysMs);
    expect(DEAD_TIME).toBe(threeDaysMs);
  });

  it("supports stat engine constant overrides", () => {
    const now = new Date("2026-01-01T02:00:00.000Z");
    const defaultStats = calculateCurrentStats(basePixegotchi, now);
    const overriddenStats = calculateCurrentStats(basePixegotchi, now, {
      constants: {
        degradationStats: {
          hunger: {
            DECAY: 1,
            DECAY_LVL: 0,
          },
        },
      },
    });

    expect(overriddenStats.hunger).toBeGreaterThan(defaultStats.hunger);
    expect(overriddenStats.cleanliness).toBe(defaultStats.cleanliness);
  });

  it("applies lazy degradation incrementally by hour", () => {
    const mid = new Date("2026-01-01T10:00:00.000Z");
    const end = new Date("2026-01-01T20:00:00.000Z");
    const directStats = calculateCurrentStats(basePixegotchi, end);
    const midStats = calculateCurrentStats(basePixegotchi, mid);
    const steppedStats = calculateCurrentStats(
      {
        ...basePixegotchi,
        ...midStats,
        lastUpdateAt: mid,
      },
      end,
    );

    expect(directStats).toEqual(steppedStats);
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

  it("derives active, critical, and dead statuses from health timers", () => {
    const healthZeroAt = new Date("2026-01-01T00:00:00.000Z");
    const criticalSince = new Date(healthZeroAt.getTime() + CRITICAL_TIME);
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
          healthZeroAt: null,
          criticalSince: null,
        },
        stats,
        new Date(healthZeroAt.getTime()),
      ),
    ).toBe("active");
    expect(
      derivePixegotchiStatus(
        {
          ...basePixegotchi,
          health: 0,
          healthZeroAt,
          criticalSince: null,
        },
        stats,
        new Date(healthZeroAt.getTime() + CRITICAL_TIME / 2),
      ),
    ).toBe("active");
    expect(
      derivePixegotchiStatus(
        {
          ...basePixegotchi,
          health: 0,
          healthZeroAt,
          criticalSince,
        },
        stats,
        new Date(criticalSince.getTime() + DEAD_TIME / 2),
      ),
    ).toBe("critical");
    expect(
      derivePixegotchiStatus(
        {
          ...basePixegotchi,
          health: 0,
          healthZeroAt,
          criticalSince,
        },
        stats,
        new Date(criticalSince.getTime() + DEAD_TIME),
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
