import type { RoomAssetPlacement } from "./roomSlots";
import type { EquippedRoomCosmetic } from "@pixegotchi/shared";
import {
  CURTAIN_ROOM_ASSETS,
  DECOR_ROOM_ASSETS,
  FURNITURE_ROOM_ASSETS,
  RUG_ROOM_ASSETS,
  SOFA_ROOM_ASSETS,
  WALL_ART_ROOM_ASSETS,
  WINDOW_ROOM_ASSETS,
} from "./assets";
import type { RoomAssetDefinition } from "./assets";

export const ROOM_ASSETS = [
  ...WINDOW_ROOM_ASSETS,
  ...CURTAIN_ROOM_ASSETS,
  ...FURNITURE_ROOM_ASSETS,
  ...SOFA_ROOM_ASSETS,
  ...RUG_ROOM_ASSETS,
  ...WALL_ART_ROOM_ASSETS,
  ...DECOR_ROOM_ASSETS,
] as const satisfies readonly RoomAssetDefinition[];

export const buildRoomAssetPlacementsFromLoadout = (
  placements: EquippedRoomCosmetic[],
): RoomAssetPlacement[] =>
  placements.flatMap((placement): RoomAssetPlacement[] => {
    const asset = ROOM_ASSETS.find(
      ({ id }) => id === placement.cosmeticAssetId,
    );
    if (!asset) return [];

    const node = (
      <img src={`${import.meta.env.BASE_URL}${asset.src}`} alt={asset.label} />
    );

    if ("span" in asset && asset.span === 2) {
      if (placement.position !== 1 && placement.position !== 3) return [];
      return [
        {
          id: asset.id,
          slot: placement.position,
          span: 2,
          node,
        },
      ];
    }

    return [
      {
        id: asset.id,
        slot: placement.position,
        layer: "layer" in asset ? asset.layer : undefined,
        node,
      },
    ];
  });
