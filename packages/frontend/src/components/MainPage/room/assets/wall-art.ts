import type { RoomAssetDefinition } from "./types";

// Wall art can be placed symmetrically through server allowedPositions.
export const WALL_ART_ROOM_ASSETS = [
  {
    id: "botanical-frame",
    label: "Wall art",
    src: "assets/room/wall-art/botanical-frame.png",
    slot: 1,
  },
  {
    id: "moon-frame",
    label: "Moon frame",
    src: "assets/room/wall-art/moon-frame.png",
    slot: 1,
  },
  {
    id: "nature-frame",
    label: "Nature frame",
    src: "assets/room/wall-art/nature-frame.png",
    slot: 3,
  },
  {
    id: "vimpel-frame",
    label: "Vimpel frame",
    src: "assets/room/wall-art/vimpel-frame.png",
    slot: 3,
  },
] as const satisfies readonly RoomAssetDefinition[];
