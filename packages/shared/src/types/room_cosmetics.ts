import type { RarityType } from "../enums";

export type RoomCosmeticSlot =
  | "environment"
  | "floor"
  | "window"
  | "curtain"
  | "rug"
  | "wallArt"
  | "furniture"
  | "sofa"
  | "decor";

export type RoomSurfaceCosmeticSlot = Extract<
  RoomCosmeticSlot,
  "environment" | "floor"
>;

export type RoomPositionedCosmeticSlot = Exclude<
  RoomCosmeticSlot,
  RoomSurfaceCosmeticSlot
>;

export type RoomCosmeticPosition =
  | 1
  | 2
  | 3
  | 4
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11;

interface BaseRoomCosmeticAsset {
  id: string;
  name: string;
  rarity: RarityType;
  assetUrl: string | null;
  environmentId: string | null;
  isDefault: boolean;
  isLimited: boolean;
  isTradable: boolean;
  isActive: boolean;
}

export interface RoomSurfaceCosmeticAsset extends BaseRoomCosmeticAsset {
  slot: RoomSurfaceCosmeticSlot;
}

export interface RoomPositionedCosmeticAsset extends BaseRoomCosmeticAsset {
  slot: RoomPositionedCosmeticSlot;
  allowedPositions: RoomCosmeticPosition[];
  span: 1 | 2;
  allowOverlap: boolean;
}

export type RoomCosmeticAsset =
  | RoomSurfaceCosmeticAsset
  | RoomPositionedCosmeticAsset;

export interface UserRoomCosmetic {
  userId: number;
  cosmeticAssetId: string;
  quantity: number;
  acquiredAt: string;
  asset?: RoomCosmeticAsset;
}

export interface EquippedRoomCosmetic {
  cosmeticAssetId: string;
  position: RoomCosmeticPosition;
}

export interface RoomLoadout {
  userId: number;
  environmentId: string;
  floorId: string | null;
  placements: EquippedRoomCosmetic[];
  updatedAt: string;
}

export interface RoomCosmeticsCatalogResponse {
  assets: RoomCosmeticAsset[];
}

export interface UserRoomCosmeticsResponse {
  cosmetics: UserRoomCosmetic[];
}

export interface RoomCosmeticsInventoryResponse {
  assets: RoomCosmeticAsset[];
}

export interface UserRoomLoadoutResponse {
  loadout: RoomLoadout | null;
}

export interface EquipRoomCosmeticInput {
  cosmeticAssetId: string;
  position?: RoomCosmeticPosition;
}

export interface UnequipRoomCosmeticInput {
  cosmeticAssetId: string;
  position?: RoomCosmeticPosition;
}

export interface SaveRoomLoadoutInput {
  environmentId: string;
  floorId: string | null;
  placements: EquippedRoomCosmetic[];
}

export interface UpdateRoomCosmeticResponse {
  loadout: RoomLoadout;
}
