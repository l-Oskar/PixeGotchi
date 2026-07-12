import type { RoomAssetPlacement } from "./roomSlots";

export const ROOM_ASSETS = [
  {
    id: "arched-window-day",
    label: "Window",
    src: "assets/room/windows/arched-window-day.png",
    slot: 7,
  },
  {
    id: "pink-window-curtains",
    label: "Pink curtains",
    src: "assets/room/curtains/pink-window-curtains.png",
    slot: 7,
    allowOverlap: true,
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
    label: "Purple sofa",
    src: "assets/room/furniture/purple-sofa.png",
    slot: 8,
  },
  {
    id: "blue-sofa",
    label: "Blue sofa",
    src: "assets/room/furniture/blue-sofa.png",
    slot: 8,
  },
  {
    id: "purple-oval-rug",
    label: "Purple rug",
    src: "assets/room/rugs/purple-oval-rug.png",
    slot: 9,
  },
  {
    id: "blue-oval-rug",
    label: "Blue rug",
    src: "assets/room/rugs/blue-oval-rug.png",
    slot: 9,
  },
  {
    id: "botanical-frame",
    label: "Wall art",
    src: "assets/room/wall-art/botanical-frame.png",
    slot: 1,
  },
  {
    id: "yellow-lantern",
    label: "Lantern",
    src: "assets/room/decor/yellow-lantern.png",
    slot: 10,
  },
  {
    id: "bonsai-pot",
    label: "Bonsai",
    src: "assets/room/decor/bonsai-pot.png",
    slot: 11,
  },
] as const;

export type RoomAssetId = (typeof ROOM_ASSETS)[number]["id"];

export const DEFAULT_HIDDEN_ROOM_ASSET_IDS: RoomAssetId[] = [
  "blue-sofa",
  "blue-oval-rug",
];

export const buildRoomAssetPlacements = (
  hiddenAssetIds: RoomAssetId[],
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
            allowOverlap:
              "allowOverlap" in asset ? asset.allowOverlap : undefined,
            node: (
              <img
                src={`${import.meta.env.BASE_URL}${asset.src}`}
                alt={asset.label}
              />
            ),
          };
    },
  );
