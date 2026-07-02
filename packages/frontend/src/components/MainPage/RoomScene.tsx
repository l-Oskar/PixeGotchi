import React from "react";

interface RoomSceneProps {
  children: React.ReactNode;
  className?: string;
}

export const RoomScene: React.FC<RoomSceneProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`pixel-panel-soft pixel-room-bg relative flex h-48 items-center justify-center overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-pixel-bg-deep/35 to-transparent" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {children}
      </div>
    </div>
  );
};
