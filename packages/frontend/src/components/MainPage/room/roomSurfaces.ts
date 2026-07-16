export const ROOM_WALLS = [
  { id: "violet-brick", label: "Violet brick", className: "room-wall-violet" },
  {
    id: "midnight-brick",
    label: "Midnight brick",
    className: "room-wall-midnight",
  },
  { id: "warm-plaster", label: "Warm plaster", className: "room-wall-warm" },
] as const;

export const ROOM_FLOORS = [
  { id: "plum-boards", label: "Plum boards", className: "room-floor-plum" },
  { id: "dark-boards", label: "Dark boards", className: "room-floor-dark" },
  { id: "honey-boards", label: "Honey boards", className: "room-floor-honey" },
] as const;

export type RoomWallId = (typeof ROOM_WALLS)[number]["id"];
export type RoomFloorId = (typeof ROOM_FLOORS)[number]["id"];

export const DEFAULT_ROOM_WALL_ID: RoomWallId = "violet-brick";
export const DEFAULT_ROOM_FLOOR_ID: RoomFloorId = "plum-boards";

export const getRoomWall = (id: RoomWallId) =>
  ROOM_WALLS.find((wall) => wall.id === id) ?? ROOM_WALLS[0];

export const getRoomFloor = (id: RoomFloorId) =>
  ROOM_FLOORS.find((floor) => floor.id === id) ?? ROOM_FLOORS[0];
