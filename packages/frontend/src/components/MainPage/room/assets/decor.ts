import type { RoomAssetDefinition } from "./types";

// Small floor decor for positions 10 and 11.
export const DECOR_ROOM_ASSETS = [
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
  {
    id: "books-candle",
    label: "Books and candle",
    src: "assets/room/decor/books-candle.png",
    slot: 10,
  },
  {
    id: "green-flower-pot",
    label: "Green flower pot",
    src: "assets/room/decor/green-flower-pot.png",
    slot: 11,
  },
  {
    id: "wood-chest",
    label: "Wood chest",
    src: "assets/room/decor/wood-chest.png",
    slot: 10,
  },
] as const satisfies readonly RoomAssetDefinition[];
