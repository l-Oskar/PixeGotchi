import type { RoomAssetDefinition } from "./types";

// Window assets render below curtains.
export const WINDOW_ROOM_ASSETS = [
  {
    id: "arched-window-day",
    label: "Window",
    src: "assets/room/windows/arched-window-day.png",
    slot: 6,
    layer: 4,
  },
  {
    id: "arched-window-day-2",
    label: "Arched window",
    src: "assets/room/windows/arched-window-day-2.png",
    slot: 6,
    layer: 4,
  },
  {
    id: "polygon-window-day",
    label: "Polygon window",
    src: "assets/room/windows/polygon-window-day.png",
    slot: 6,
    layer: 4,
  },
  {
    id: "round-window-day",
    label: "Round window",
    src: "assets/room/windows/round-window-day.png",
    slot: 6,
    layer: 4,
  },
] as const satisfies readonly RoomAssetDefinition[];
