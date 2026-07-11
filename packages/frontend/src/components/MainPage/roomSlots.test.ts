import { describe, expect, it } from "vitest";
import {
  getOccupiedRoomSlots,
  getRoomGuideSlotBounds,
  resolveRoomAssetPlacements,
} from "./roomSlots";
import type { RoomAssetPlacement } from "./roomSlots";

const asset = (
  id: string,
  slot: 1 | 2 | 3 | 4,
): RoomAssetPlacement => ({
  id,
  slot,
  node: id,
});

describe("room slot placements", () => {
  it("reports both occupied slots for tall furniture", () => {
    expect(
      getOccupiedRoomSlots({
        id: "left-cabinet",
        slot: 1,
        span: 2,
        node: "cabinet",
      }),
    ).toEqual([1, 2]);
    expect(
      getOccupiedRoomSlots({
        id: "right-cabinet",
        slot: 3,
        span: 2,
        node: "cabinet",
      }),
    ).toEqual([3, 4]);
  });

  it("keeps the first asset when later placements collide", () => {
    const placements: RoomAssetPlacement[] = [
      {
        id: "cabinet",
        slot: 1,
        span: 2,
        node: "cabinet",
      },
      asset("small-decor", 2),
    ];

    expect(resolveRoomAssetPlacements(placements).map(({ id }) => id)).toEqual([
      "cabinet",
    ]);
  });

  it("allows independent left and right double placements", () => {
    const placements: RoomAssetPlacement[] = [
      {
        id: "left-cabinet",
        slot: 1,
        span: 2,
        node: "left",
      },
      {
        id: "right-cabinet",
        slot: 3,
        span: 2,
        node: "right",
      },
    ];

    expect(resolveRoomAssetPlacements(placements)).toHaveLength(2);
  });

  it("keeps mirrored side slots vertically synchronized", () => {
    const leftTop = getRoomGuideSlotBounds(1);
    const rightTop = getRoomGuideSlotBounds(3);
    const leftBottom = getRoomGuideSlotBounds(2);
    const rightBottom = getRoomGuideSlotBounds(4);

    expect(leftTop.top).toBe(rightTop.top);
    expect(leftTop.width).toBe(rightTop.width);
    expect(leftTop.height).toBe(rightTop.height);
    expect(leftBottom.top).toBe(rightBottom.top);
    expect(leftBottom.width).toBe(rightBottom.width);
    expect(leftBottom.height).toBe(rightBottom.height);
  });
});
