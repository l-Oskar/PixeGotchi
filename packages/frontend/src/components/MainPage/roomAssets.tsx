import type { RoomAssetPlacement } from "./roomSlots";

export const ROOM_ASSETS = [
  {
    id: "arched-window-day",
    label: "Window",
    src: "assets/room/windows/arched-window-day.png",
    slot: 7,
  },
  {
    id: "tall-cabinet-wood",
    label: "Cabinet",
    src: "assets/room/furniture/tall-cabinet-wood.png",
    slot: 3,
    span: 2,
  },
  {
    id: "purple-sofa",
    label: "Sofa",
    src: "assets/room/furniture/purple-sofa.png",
    slot: 8,
  },
  {
    id: "purple-oval-rug",
    label: "Rug",
    src: "assets/room/rugs/purple-oval-rug.png",
    slot: 9,
  },
] as const;

export type RoomAssetId = (typeof ROOM_ASSETS)[number]["id"];

export const buildRoomAssetPlacements = (
  hiddenAssetIds: string[],
  cabinetSlot: 1 | 3,
): RoomAssetPlacement[] =>
  ROOM_ASSETS.filter((asset) => !hiddenAssetIds.includes(asset.id)).map(
    (asset): RoomAssetPlacement => {
      return asset.id === "tall-cabinet-wood"
        ? {
            id: asset.id,
            slot: cabinetSlot,
            span: 2,
            node: (
              <img
                src={`${import.meta.env.BASE_URL}${asset.src}`}
                alt={asset.label}
              />
            ),
          }
        : {
            id: asset.id,
            slot: asset.slot,
            node: (
              <img
                src={`${import.meta.env.BASE_URL}${asset.src}`}
                alt={asset.label}
              />
            ),
          };
    },
  );
