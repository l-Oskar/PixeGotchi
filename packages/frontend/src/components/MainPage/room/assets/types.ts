import type { RoomSlotId } from "../roomSlots";

// Shared shape for frontend-only PNG render definitions.
export interface RoomAssetDefinition {
  id: string;
  label: string;
  src: string;
  slot: RoomSlotId;
  span?: 1 | 2;
  layer?: number;
}
