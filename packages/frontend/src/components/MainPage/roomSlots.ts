import type { CSSProperties, ReactNode } from "react";

export type RoomSlotId = 1 | 2 | 3 | 4 | 6 | 7 | 8 | 9 | 10 | 11;
export type RoomGuideSlotId = RoomSlotId | 5;

export const ROOM_GUIDE_SLOT_IDS: RoomGuideSlotId[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
];

type SingleRoomAssetPlacement = {
  id: string;
  node: ReactNode;
  slot: RoomSlotId;
  span?: 1;
  layer?: number;
  allowOverlap?: boolean;
};

type DoubleRoomAssetPlacement = {
  id: string;
  node: ReactNode;
  slot: 1 | 3;
  span: 2;
  layer?: number;
  allowOverlap?: boolean;
};

export type RoomAssetPlacement =
  | SingleRoomAssetPlacement
  | DoubleRoomAssetPlacement;

const SIDE_TOP_SLOT_SIZE: CSSProperties = {
  top: "19%",
  width: "22%",
  height: "24%",
};

const SIDE_BOTTOM_SLOT_SIZE: CSSProperties = {
  top: "48%",
  width: "22%",
  height: "27%",
};

const LEFT_SIDE_POSITION: CSSProperties = { left: "7%" };
const RIGHT_SIDE_POSITION: CSSProperties = { right: "7%" };

const SLOT_BOUNDS: Record<RoomSlotId, CSSProperties> = {
  1: { ...LEFT_SIDE_POSITION, ...SIDE_TOP_SLOT_SIZE },
  2: { ...LEFT_SIDE_POSITION, ...SIDE_BOTTOM_SLOT_SIZE },
  3: { ...RIGHT_SIDE_POSITION, ...SIDE_TOP_SLOT_SIZE },
  4: { ...RIGHT_SIDE_POSITION, ...SIDE_BOTTOM_SLOT_SIZE },
  6: { left: "39%", top: "21%", width: "22%", height: "28%" },
  7: { left: "27%", top: "13%", width: "46%", height: "34%" },
  8: { left: "29%", top: "42%", width: "42%", height: "34%" },
  9: { left: "29%", bottom: "2%", width: "42%", height: "25%" },
  10: { left: "7%", bottom: "2%", width: "22%", height: "25%" },
  11: { right: "7%", bottom: "2%", width: "22%", height: "25%" },
};

const ASSET_BOUNDS_OVERRIDES: Partial<Record<RoomSlotId, CSSProperties>> = {
  6: { left: "36%", top: "18%", width: "28%", height: "34%" },
  7: { left: "27%", top: "18%", width: "46%", height: "34%" },
  10: { left: "10%", bottom: "5%", width: "16%", height: "18%" },
  11: { right: "10%", bottom: "5%", width: "16%", height: "18%" },
};

const DOUBLE_SLOT_BOUNDS: Record<1 | 3, CSSProperties> = {
  1: { ...LEFT_SIDE_POSITION, top: "19%", width: "22%", height: "56%" },
  3: { ...RIGHT_SIDE_POSITION, top: "19%", width: "22%", height: "56%" },
};

const PET_SLOT_BOUNDS: CSSProperties = {
  left: "39%",
  top: "44%",
  width: "22%",
  height: "43%",
};

export const getRoomGuideSlotBounds = (
  slot: RoomGuideSlotId,
): CSSProperties => (slot === 5 ? PET_SLOT_BOUNDS : SLOT_BOUNDS[slot]);

export const getRoomAssetBounds = (
  placement: RoomAssetPlacement,
): CSSProperties =>
  placement.span === 2
    ? DOUBLE_SLOT_BOUNDS[placement.slot]
    : ASSET_BOUNDS_OVERRIDES[placement.slot] ?? SLOT_BOUNDS[placement.slot];

export const getRoomSlotTargetBounds = (
  slot: RoomSlotId,
  span: 1 | 2,
): CSSProperties =>
  span === 2 && (slot === 1 || slot === 3)
    ? DOUBLE_SLOT_BOUNDS[slot]
    : SLOT_BOUNDS[slot];

export const getOccupiedRoomSlots = (
  placement: RoomAssetPlacement,
): RoomSlotId[] => {
  if (placement.span !== 2) return [placement.slot];

  return placement.slot === 1 ? [1, 2] : [3, 4];
};

export const resolveRoomAssetPlacements = (
  placements: RoomAssetPlacement[],
): RoomAssetPlacement[] => {
  const occupiedSlots = new Set<RoomSlotId>();

  return placements.filter((placement) => {
    const slots = getOccupiedRoomSlots(placement);
    if (placement.allowOverlap) return true;
    if (slots.some((slot) => occupiedSlots.has(slot))) return false;

    slots.forEach((slot) => occupiedSlots.add(slot));
    return true;
  });
};
