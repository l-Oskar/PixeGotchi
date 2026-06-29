import { describe, expect, it } from "vitest";
import {
  RarityType,
  assertValidGenomeHash,
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
});
