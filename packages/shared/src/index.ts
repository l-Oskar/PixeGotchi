// Enums
export * from "./enums";

// Utils
export {
  validateGenomeHash,
  assertValidGenomeHash,
} from "./utils/genome-validator";
export { GenomeGenerator } from "./utils/genome-generator";
export type { GenomeGeneratorOptions } from "./utils/genome-generator";
export { ChestGenerator } from "./utils/chest-generator";
export type { ChestGeneratorOptions } from "./utils/chest-generator";
export { round } from "./utils/calculate_stats/calculate_delta";
export {
  calculateCurrentStats,
  calculateHourlyStatChanges,
  derivePixegotchiStatus,
  buildPixegotchiSnapshot,
} from "./utils/calculate_stats/lazy_degradation";
export type {
  PixegotchiSnapshot,
  StatEngineConstantOverrides,
  StatEngineConstants,
  StatEngineOptions,
} from "./utils/calculate_stats/lazy_degradation";
export {
  getEnergyCost,
  getFinalEnergyCost,
} from "./utils/calculate_stats/calculate_energy";
export { getFinalExp } from "./utils/calculate_stats/calculate_exp";
export { getFinalPgc } from "./utils/calculate_stats/calculate_pgc";

export * from "./types/item_buffs";
export * from "./constants/pixegotchi_const";
export * from "./constants/egg_const";
export * from "./constants/user_const";
export * from "./constants/item_const";
export * from "./constants/items/items_img";
export * from "./constants/items/item_pool";
export * from "./constants/traits_const";
export * from "./constants/chest_const";
export * from "./constants/colors_const";

// Domain types
export type {
  Pixegotchi,
  DeltaContext,
  PixegotchiStats,
  PixegotchiState,
  Cooldowns,
  TickContext,
  RarityStatsType,
  GenomeInfo,
  PixegotchiContext,
} from "./types/pixegotchi";
export type { User, UserProfile } from "./types/user";
export type { InventoryItem, InventoryWithDetails } from "./types/inventory";
export type { Item, ItemEffects } from "./types/item";
export type { ItemBuffs } from "./types/item_buffs";
export { parseItem, parseItemEffects } from "./types/item";
export type {
  Chest,
  ChestInventory,
  ChestInfo,
  ChestDescription,
  ChestPreview,
  ChestRewardItem,
  ChestRewards,
  ChestConfig,
} from "./types/chest";
export type {
  TraitType,
  TraitEffect,
  TraitEffectKey,
} from "./types/traits";
export type { ApiSuccess, ApiError, ApiResponse } from "./types/api";
export type { HomePageProps } from "./types/pages";
export type {
  GameConfig,
  GameSession,
  StartGameSessionInput,
  CompleteGameSessionPayload,
  CompleteGameSessionInput,
} from "./types/game";
export { GAME_CONFIGS } from "./constants/games/games_const ";
export type { MarketplaceListing } from "./types/marketplace";
export type { Egg, UpdatedEgg, EggHatchingStatus } from "./types/egg";
export type { ElementStats, VaultStats } from "./types/vault";
export type {
  RoomCosmeticSlot,
  RoomSurfaceCosmeticSlot,
  RoomPositionedCosmeticSlot,
  RoomCosmeticPosition,
  RoomCosmeticAsset,
  RoomSurfaceCosmeticAsset,
  RoomPositionedCosmeticAsset,
  UserRoomCosmetic,
  EquippedRoomCosmetic,
  RoomLoadout,
  RoomCosmeticsCatalogResponse,
  UserRoomCosmeticsResponse,
  UserRoomLoadoutResponse,
  EquipRoomCosmeticInput,
  UnequipRoomCosmeticInput,
  UpdateRoomCosmeticResponse,
} from "./types/room_cosmetics";
export { isApiError } from "./types/api";
