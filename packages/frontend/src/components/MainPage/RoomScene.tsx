import React from "react";
import {
  DEFAULT_ROOM_FLOOR_ID,
  DEFAULT_ROOM_WALL_ID,
  getRoomFloor,
  getRoomWall,
} from "./roomSurfaces";
import type { RoomFloorId, RoomWallId } from "./roomSurfaces";
import {
  getOccupiedRoomSlots,
  getRoomGuideSlotBounds,
  getRoomAssetBounds,
  ROOM_GUIDE_SLOT_IDS,
  resolveRoomAssetPlacements,
} from "./roomSlots";
import type { RoomAssetPlacement } from "./roomSlots";

export type RoomSceneSlot =
  | "environment"
  | "wall"
  | "floor"
  | "rug"
  | "wallArt"
  | "furniture"
  | "decor";

export type RoomSceneLayers = Partial<Record<RoomSceneSlot, React.ReactNode>>;

interface RoomSceneProps {
  children: React.ReactNode;
  className?: string;
  layers?: RoomSceneLayers;
  wallId?: RoomWallId;
  floorId?: RoomFloorId;
  assets?: RoomAssetPlacement[];
  showSlotGuides?: boolean;
}

export const RoomScene: React.FC<RoomSceneProps> = ({
  children,
  className = "",
  layers,
  wallId = DEFAULT_ROOM_WALL_ID,
  floorId = DEFAULT_ROOM_FLOOR_ID,
  assets = [],
  showSlotGuides = false,
}) => {
  const wall = getRoomWall(wallId);
  const floor = getRoomFloor(floorId);
  const visibleAssets = resolveRoomAssetPlacements(assets);

  return (
    <div
      className={`pixel-panel-soft pixel-room-bg relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}>
      {layers?.environment && (
        <div className="pointer-events-none absolute inset-0 z-0">
          {layers.environment}
        </div>
      )}
      <div
        className={`room-wall-surface ${wall.className} pointer-events-none absolute inset-x-0 top-0 z-[1] h-[62%] overflow-hidden`}>
        {layers?.wall}
      </div>
      <div
        className={`room-floor-surface ${floor.className} pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[38%] overflow-hidden`}>
        {layers?.floor}
      </div>
      <div className="room-surface-seam pointer-events-none absolute inset-x-0 top-[62%] z-[2]" />
      {layers?.wallArt && (
        <div className="pointer-events-none absolute inset-x-[8%] top-[4%] z-[3]">
          {layers.wallArt}
        </div>
      )}
      {layers?.rug && (
        <div className="pointer-events-none absolute inset-x-[14%] bottom-[4%] z-[3] h-[20%]">
          {layers.rug}
        </div>
      )}
      {layers?.furniture && (
        <div className="pointer-events-none absolute inset-x-[4%] bottom-[16%] z-[4]">
          {layers.furniture}
        </div>
      )}
      {visibleAssets.map((asset) => (
        <div
          key={asset.id}
          className="room-asset-slot pointer-events-none absolute z-[5] flex items-end justify-center"
          style={getRoomAssetBounds(asset)}
          data-room-slots={getOccupiedRoomSlots(asset).join(",")}>
          {asset.node}
        </div>
      ))}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-pixel-bg-deep/35 to-transparent" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
      {showSlotGuides && (
        <div className="pointer-events-none absolute inset-0 z-30">
          {ROOM_GUIDE_SLOT_IDS.map((slot) => (
            <div
              key={slot}
              className="room-slot-guide absolute grid place-items-center"
              style={getRoomGuideSlotBounds(slot)}
              data-room-guide-slot={slot}>
              <span>{slot}</span>
            </div>
          ))}
        </div>
      )}
      {layers?.decor && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {layers.decor}
        </div>
      )}
    </div>
  );
};
