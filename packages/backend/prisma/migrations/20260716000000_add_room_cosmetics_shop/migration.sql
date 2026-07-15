ALTER TABLE "cosmetic_assets"
ADD COLUMN "is_purchasable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pgc_price" DECIMAL(20, 8);

CREATE INDEX "cosmetic_assets_is_purchasable_is_active_idx"
ON "cosmetic_assets"("is_purchasable", "is_active");

INSERT INTO "user_cosmetics" (
  "user_id",
  "cosmetic_asset_id",
  "quantity",
  "acquired_at",
  "updated_at"
)
SELECT
  "user_room_loadouts"."user_id",
  'blue-sofa',
  1,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "user_room_loadouts"
INNER JOIN "room_cosmetic_placements"
  ON "room_cosmetic_placements"."loadout_id" = "user_room_loadouts"."id"
WHERE "room_cosmetic_placements"."cosmetic_asset_id" = 'blue-sofa'
ON CONFLICT ("user_id", "cosmetic_asset_id") DO NOTHING;

UPDATE "cosmetic_assets"
SET
  "is_default" = false,
  "is_tradable" = true,
  "is_purchasable" = true,
  "pgc_price" = 400
WHERE "id" = 'blue-sofa';
