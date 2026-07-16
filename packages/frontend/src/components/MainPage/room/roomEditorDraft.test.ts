import type {
  RoomCosmeticAsset,
  RoomPositionedCosmeticAsset,
  SaveRoomLoadoutInput,
} from "@pixegotchi/shared";
import { describe, expect, it } from "vitest";
import {
  getRoomAssetPlacementPositionForSlot,
  placeRoomAsset,
  removeRoomAsset,
} from "./roomEditorDraft";

const draft: SaveRoomLoadoutInput = {
  environmentId: "violet-brick",
  floorId: "plum-boards",
  placements: [],
};

const asset = (
  id: string,
  allowedPositions: RoomPositionedCosmeticAsset["allowedPositions"],
  span: 1 | 2 = 1,
): RoomPositionedCosmeticAsset => ({
  id,
  name: id,
  slot: "furniture",
  rarity: "common",
  assetUrl: null,
  environmentId: null,
  allowedPositions,
  span,
  allowOverlap: false,
  isDefault: true,
  isLimited: false,
  isTradable: false,
  isActive: true,
});

describe("room editor draft", () => {
  it("matches single and double-height assets to a selected room slot", () => {
    const cabinet = asset("cabinet", [1, 3], 2);
    const picture = {
      ...asset("picture", [1, 3]),
      slot: "wallArt" as const,
    };

    expect(getRoomAssetPlacementPositionForSlot(cabinet, 1)).toBe(1);
    expect(getRoomAssetPlacementPositionForSlot(cabinet, 2)).toBe(1);
    expect(getRoomAssetPlacementPositionForSlot(cabinet, 3)).toBe(3);
    expect(getRoomAssetPlacementPositionForSlot(cabinet, 4)).toBe(3);
    expect(getRoomAssetPlacementPositionForSlot(picture, 1)).toBe(1);
    expect(getRoomAssetPlacementPositionForSlot(picture, 2)).toBeNull();
  });

  it("replaces a conflicting asset in the selected position", () => {
    const purpleSofa = asset("purple-sofa", [8]);
    const blueSofa = asset("blue-sofa", [8]);
    const inventory: RoomCosmeticAsset[] = [purpleSofa, blueSofa];
    const current = placeRoomAsset(draft, purpleSofa, 8, inventory);

    expect(placeRoomAsset(current, blueSofa, 8, inventory).placements).toEqual([
      { cosmeticAssetId: "blue-sofa", position: 8 },
    ]);
  });

  it("moves a double-height asset between the supported pairs", () => {
    const cabinet = asset("cabinet", [1, 3], 2);
    const inventory: RoomCosmeticAsset[] = [cabinet];
    const left = placeRoomAsset(draft, cabinet, 1, inventory);

    expect(placeRoomAsset(left, cabinet, 3, inventory).placements).toEqual([
      { cosmeticAssetId: "cabinet", position: 3 },
    ]);
  });

  it("removes a positioned asset from the draft", () => {
    const sofa = asset("sofa", [8]);
    const current = placeRoomAsset(draft, sofa, 8, [sofa]);

    expect(removeRoomAsset(current, sofa.id).placements).toEqual([]);
  });

  it("removes a tall cabinet when wall art takes its top slot", () => {
    const cabinet = asset("cabinet", [1, 3], 2);
    const picture = {
      ...asset("picture", [1, 3]),
      slot: "wallArt" as const,
    };
    const inventory: RoomCosmeticAsset[] = [cabinet, picture];
    const withCabinet = placeRoomAsset(draft, cabinet, 1, inventory);

    expect(placeRoomAsset(withCabinet, picture, 1, inventory).placements).toEqual([
      { cosmeticAssetId: "picture", position: 1 },
    ]);
  });

  it("clears both side slots when a tall cabinet is placed", () => {
    const cabinet = asset("cabinet", [1, 3], 2);
    const picture = {
      ...asset("picture", [1, 3]),
      slot: "wallArt" as const,
    };
    const nightstand = asset("nightstand", [2, 4]);
    const inventory: RoomCosmeticAsset[] = [cabinet, picture, nightstand];
    const withPicture = placeRoomAsset(draft, picture, 1, inventory);
    const withBothSlots = placeRoomAsset(
      withPicture,
      nightstand,
      2,
      inventory,
    );

    expect(
      placeRoomAsset(withBothSlots, cabinet, 1, inventory).placements,
    ).toEqual([{ cosmeticAssetId: "cabinet", position: 1 }]);
  });

  it("moves decor freely between positions 10 and 11", () => {
    const lantern = {
      ...asset("lantern", [10, 11]),
      slot: "decor" as const,
    };
    const inventory: RoomCosmeticAsset[] = [lantern];
    const left = placeRoomAsset(draft, lantern, 10, inventory);

    expect(placeRoomAsset(left, lantern, 11, inventory).placements).toEqual([
      { cosmeticAssetId: "lantern", position: 11 },
    ]);
  });
});
