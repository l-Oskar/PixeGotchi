import type { RoomAssetDefinition } from "./types";

// Side furniture, including double-height assets.
export const FURNITURE_ROOM_ASSETS = [
  {
    id: "tall-cabinet-wood",
    label: "Cabinet",
    src: "assets/room/furniture/tall-cabinet-wood.png",
    slot: 3,
    span: 2,
  },
  {
    id: "flowers-cabinet-wood",
    label: "Flowers cabinet",
    src: "assets/room/furniture/flowers-cabinet-wood.png",
    slot: 1,
    span: 2,
  },
  {
    id: "globe-cabinet-wood",
    label: "Globe cabinet",
    src: "assets/room/furniture/globe-cabinet-wood.png",
    slot: 3,
    span: 2,
  },
] as const satisfies readonly RoomAssetDefinition[];
