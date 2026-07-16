import type { RoomAssetDefinition } from "./types";

// Curtain assets use their own position and a higher render layer.
export const CURTAIN_ROOM_ASSETS = [
  {
    id: "pink-window-curtains",
    label: "Pink curtains",
    src: "assets/room/curtains/pink-window-curtains.png",
    slot: 7,
    layer: 5,
  },
] as const satisfies readonly RoomAssetDefinition[];
