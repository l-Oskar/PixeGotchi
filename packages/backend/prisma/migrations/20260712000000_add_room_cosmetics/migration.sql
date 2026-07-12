CREATE TYPE "RoomCosmeticSlot" AS ENUM (
  'environment',
  'floor',
  'rug',
  'wallArt',
  'furniture',
  'decor'
);

CREATE TABLE "cosmetic_assets" (
  "id" VARCHAR(64) NOT NULL,
  "name" VARCHAR(100) NOT NULL,
  "slot" "RoomCosmeticSlot" NOT NULL,
  "rarity" "RarityType" NOT NULL DEFAULT 'common',
  "asset_url" VARCHAR(255),
  "environment_id" VARCHAR(64),
  "allowed_positions" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[],
  "span" INTEGER NOT NULL DEFAULT 1,
  "allow_overlap" BOOLEAN NOT NULL DEFAULT false,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "is_limited" BOOLEAN NOT NULL DEFAULT false,
  "is_tradable" BOOLEAN NOT NULL DEFAULT true,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "cosmetic_assets_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "cosmetic_assets_span_check" CHECK ("span" IN (1, 2))
);

CREATE TABLE "user_cosmetics" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "cosmetic_asset_id" VARCHAR(64) NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "acquired_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_cosmetics_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_cosmetics_quantity_check" CHECK ("quantity" > 0)
);

CREATE TABLE "user_room_loadouts" (
  "id" SERIAL NOT NULL,
  "user_id" INTEGER NOT NULL,
  "environment_id" VARCHAR(64) NOT NULL,
  "floor_id" VARCHAR(64),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_room_loadouts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "room_cosmetic_placements" (
  "id" SERIAL NOT NULL,
  "loadout_id" INTEGER NOT NULL,
  "cosmetic_asset_id" VARCHAR(64) NOT NULL,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "room_cosmetic_placements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "room_cosmetic_placements_position_check"
    CHECK ("position" IN (1, 2, 3, 4, 6, 7, 8, 9, 10, 11))
);

CREATE INDEX "cosmetic_assets_slot_is_active_idx" ON "cosmetic_assets"("slot", "is_active");
CREATE INDEX "cosmetic_assets_rarity_idx" ON "cosmetic_assets"("rarity");
CREATE INDEX "cosmetic_assets_environment_id_idx" ON "cosmetic_assets"("environment_id");

CREATE UNIQUE INDEX "user_cosmetics_user_id_cosmetic_asset_id_key"
  ON "user_cosmetics"("user_id", "cosmetic_asset_id");
CREATE INDEX "user_cosmetics_user_id_idx" ON "user_cosmetics"("user_id");
CREATE INDEX "user_cosmetics_cosmetic_asset_id_idx" ON "user_cosmetics"("cosmetic_asset_id");

CREATE UNIQUE INDEX "user_room_loadouts_user_id_key" ON "user_room_loadouts"("user_id");
CREATE INDEX "user_room_loadouts_environment_id_idx" ON "user_room_loadouts"("environment_id");
CREATE INDEX "user_room_loadouts_floor_id_idx" ON "user_room_loadouts"("floor_id");

CREATE UNIQUE INDEX "room_cosmetic_placements_loadout_id_cosmetic_asset_id_position_key"
  ON "room_cosmetic_placements"("loadout_id", "cosmetic_asset_id", "position");
CREATE INDEX "room_cosmetic_placements_loadout_id_idx" ON "room_cosmetic_placements"("loadout_id");
CREATE INDEX "room_cosmetic_placements_cosmetic_asset_id_idx"
  ON "room_cosmetic_placements"("cosmetic_asset_id");

ALTER TABLE "cosmetic_assets"
  ADD CONSTRAINT "cosmetic_assets_environment_id_fkey"
  FOREIGN KEY ("environment_id") REFERENCES "cosmetic_assets"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user_cosmetics"
  ADD CONSTRAINT "user_cosmetics_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_cosmetics"
  ADD CONSTRAINT "user_cosmetics_cosmetic_asset_id_fkey"
  FOREIGN KEY ("cosmetic_asset_id") REFERENCES "cosmetic_assets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_room_loadouts"
  ADD CONSTRAINT "user_room_loadouts_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_room_loadouts"
  ADD CONSTRAINT "user_room_loadouts_environment_id_fkey"
  FOREIGN KEY ("environment_id") REFERENCES "cosmetic_assets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "user_room_loadouts"
  ADD CONSTRAINT "user_room_loadouts_floor_id_fkey"
  FOREIGN KEY ("floor_id") REFERENCES "cosmetic_assets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "room_cosmetic_placements"
  ADD CONSTRAINT "room_cosmetic_placements_loadout_id_fkey"
  FOREIGN KEY ("loadout_id") REFERENCES "user_room_loadouts"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "room_cosmetic_placements"
  ADD CONSTRAINT "room_cosmetic_placements_cosmetic_asset_id_fkey"
  FOREIGN KEY ("cosmetic_asset_id") REFERENCES "cosmetic_assets"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
