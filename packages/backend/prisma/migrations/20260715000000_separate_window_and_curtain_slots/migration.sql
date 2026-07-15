ALTER TYPE "RoomCosmeticSlot" ADD VALUE IF NOT EXISTS 'window';
ALTER TYPE "RoomCosmeticSlot" ADD VALUE IF NOT EXISTS 'curtain';

UPDATE "cosmetic_assets"
SET
  "slot" = 'window',
  "allowed_positions" = ARRAY[6]::INTEGER[],
  "allow_overlap" = false,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'arched-window-day';

UPDATE "cosmetic_assets"
SET
  "slot" = 'curtain',
  "allowed_positions" = ARRAY[7]::INTEGER[],
  "allow_overlap" = false,
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'pink-window-curtains';

UPDATE "room_cosmetic_placements"
SET "position" = 6
WHERE
  "cosmetic_asset_id" = 'arched-window-day'
  AND "position" = 7;

UPDATE "user_room_loadouts"
SET "updated_at" = CURRENT_TIMESTAMP
WHERE "id" IN (
  SELECT "loadout_id"
  FROM "room_cosmetic_placements"
  WHERE
    "cosmetic_asset_id" = 'arched-window-day'
    AND "position" = 6
);
