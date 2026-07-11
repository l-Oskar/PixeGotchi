import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_ROOM_FLOOR_ID,
  DEFAULT_ROOM_WALL_ID,
  ROOM_FLOORS,
  ROOM_WALLS,
} from "@/components/MainPage/roomSurfaces";
import type {
  RoomFloorId,
  RoomWallId,
} from "@/components/MainPage/roomSurfaces";

interface RoomState {
  wallId: RoomWallId;
  floorId: RoomFloorId;
  hiddenAssetIds: string[];
  cabinetSlot: 1 | 3;
  cycleWall: () => void;
  cycleFloor: () => void;
  toggleAsset: (assetId: string) => void;
  toggleCabinetSide: () => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>()(
  persist(
    (set) => ({
      wallId: DEFAULT_ROOM_WALL_ID,
      floorId: DEFAULT_ROOM_FLOOR_ID,
      hiddenAssetIds: [],
      cabinetSlot: 3,
      cycleWall: () =>
        set((state) => {
          const currentIndex = ROOM_WALLS.findIndex(
            (wall) => wall.id === state.wallId,
          );
          const nextIndex = (Math.max(0, currentIndex) + 1) % ROOM_WALLS.length;
          return { wallId: ROOM_WALLS[nextIndex].id };
        }),
      cycleFloor: () =>
        set((state) => {
          const currentIndex = ROOM_FLOORS.findIndex(
            (floor) => floor.id === state.floorId,
          );
          const nextIndex =
            (Math.max(0, currentIndex) + 1) % ROOM_FLOORS.length;
          return { floorId: ROOM_FLOORS[nextIndex].id };
        }),
      toggleAsset: (assetId) =>
        set((state) => ({
          hiddenAssetIds: state.hiddenAssetIds.includes(assetId)
            ? state.hiddenAssetIds.filter((id) => id !== assetId)
            : [...state.hiddenAssetIds, assetId],
        })),
      toggleCabinetSide: () =>
        set((state) => ({ cabinetSlot: state.cabinetSlot === 1 ? 3 : 1 })),
      resetRoom: () =>
        set({
          wallId: DEFAULT_ROOM_WALL_ID,
          floorId: DEFAULT_ROOM_FLOOR_ID,
          hiddenAssetIds: [],
          cabinetSlot: 3,
        }),
    }),
    {
      name: "pixegotchi-room-loadout",
      version: 1,
    },
  ),
);
