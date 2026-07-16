import type { RoomAssetDefinition } from "./types";

// Rug variants for position 9.
export const RUG_ROOM_ASSETS = [
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
    id: "green-oval-rug",
    label: "Green rug",
    src: "assets/room/rugs/green-oval-rug.png",
    slot: 9,
  },
] as const satisfies readonly RoomAssetDefinition[];
