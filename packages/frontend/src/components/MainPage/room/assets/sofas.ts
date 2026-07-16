import type { RoomAssetDefinition } from "./types";

// Center sofa variants for position 8.
export const SOFA_ROOM_ASSETS = [
  {
    id: "purple-sofa",
    label: "Purple sofa",
    src: "assets/room/sofas/purple-sofa.png",
    slot: 8,
  },
  {
    id: "blue-sofa",
    label: "Blue sofa",
    src: "assets/room/sofas/blue-sofa.png",
    slot: 8,
  },
  {
    id: "green-sofa",
    label: "Green sofa",
    src: "assets/room/sofas/green-sofa.png",
    slot: 8,
  },
] as const satisfies readonly RoomAssetDefinition[];
