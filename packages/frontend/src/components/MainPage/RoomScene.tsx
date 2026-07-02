import React from "react";

export type RoomSceneSlot =
  | "environment"
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
}

export const RoomScene: React.FC<RoomSceneProps> = ({
  children,
  className = "",
  layers,
}) => {
  return (
    <div
      className={`pixel-panel-soft pixel-room-bg relative flex h-48 items-center justify-center overflow-hidden ${className}`}>
      {layers?.environment && (
        <div className="pointer-events-none absolute inset-0 z-0">
          {layers.environment}
        </div>
      )}
      {layers?.wallArt && (
        <div className="pointer-events-none absolute inset-x-8 top-4 z-0">
          {layers.wallArt}
        </div>
      )}
      {layers?.floor && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-20">
          {layers.floor}
        </div>
      )}
      {layers?.rug && (
        <div className="pointer-events-none absolute inset-x-14 bottom-4 z-0 h-10">
          {layers.rug}
        </div>
      )}
      {layers?.furniture && (
        <div className="pointer-events-none absolute inset-x-4 bottom-8 z-0">
          {layers.furniture}
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-pixel-bg-deep/35 to-transparent" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
      {layers?.decor && (
        <div className="pointer-events-none absolute inset-0 z-20">
          {layers.decor}
        </div>
      )}
    </div>
  );
};
