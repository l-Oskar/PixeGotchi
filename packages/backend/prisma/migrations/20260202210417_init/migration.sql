-- CreateEnum
CREATE TYPE "PixegotchiStatus" AS ENUM ('egg', 'active', 'vault', 'dead');

-- CreateEnum
CREATE TYPE "ElementType" AS ENUM ('fire', 'water', 'earth', 'air', 'light', 'dark');

-- CreateEnum
CREATE TYPE "RarityType" AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('food', 'medicine', 'toy', 'cleaning', 'chest', 'rename', 'special', 'boost');

-- CreateEnum
CREATE TYPE "ItemEffect" AS ENUM ('restore_hunger', 'restore_health', 'restore_energy', 'restore_happiness', 'restore_cleanliness', 'boost_experience', 'prevent_disease', 'revive');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('egg', 'item', 'chest');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('pgc', 'ton');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "telegram_id" BIGINT NOT NULL,
    "wallet_address" VARCHAR(48),
    "username" VARCHAR(255),
    "pgc_balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pixegotchis" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nft_address" VARCHAR(48),
    "genome_hash" VARCHAR(66) NOT NULL,
    "name" VARCHAR(50) NOT NULL DEFAULT 'Unnamed',
    "status" "PixegotchiStatus" NOT NULL DEFAULT 'egg',
    "element" "ElementType",
    "rarity" "RarityType",
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "lives" INTEGER NOT NULL DEFAULT 2,
    "health" INTEGER NOT NULL DEFAULT 100,
    "hunger" INTEGER NOT NULL DEFAULT 50,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "happiness" INTEGER NOT NULL DEFAULT 50,
    "cleanliness" INTEGER NOT NULL DEFAULT 100,
    "hunger_rate" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "energy_rate" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "disease_resistance" DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    "last_fed_at" TIMESTAMP(3),
    "last_played_at" TIMESTAMP(3),
    "last_slept_at" TIMESTAMP(3),
    "last_cleaned_at" TIMESTAMP(3),
    "last_healed_at" TIMESTAMP(3),
    "last_update_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hatched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pixegotchis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "item_id" VARCHAR(50) NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" SERIAL NOT NULL,
    "item_id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "item_type" "ItemType" NOT NULL,
    "rarity" "RarityType" NOT NULL DEFAULT 'common',
    "effects" JSONB NOT NULL,
    "cooldown_minutes" INTEGER,
    "max_per_day" INTEGER,
    "min_level" INTEGER DEFAULT 1,
    "icon_url" VARCHAR(255),
    "is_stackable" BOOLEAN NOT NULL DEFAULT true,
    "max_stack" INTEGER DEFAULT 99,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_usage_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pixegotchi_id" INTEGER NOT NULL,
    "item_id" VARCHAR(50) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_usage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pixegotchi_id" INTEGER NOT NULL,
    "final_level" INTEGER NOT NULL,
    "stored_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_listings" (
    "id" SERIAL NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "buyer_id" INTEGER,
    "listing_type" "ListingType" NOT NULL,
    "item_id" VARCHAR(50),
    "nft_address" VARCHAR(48),
    "price" DECIMAL(20,8) NOT NULL,
    "currency" "CurrencyType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sold_at" TIMESTAMP(3),

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "pixegotchi_id" INTEGER NOT NULL,
    "game_id" VARCHAR(50) NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "tmc_earned" DECIMAL(20,8) NOT NULL DEFAULT 0,
    "chest_dropped" BOOLEAN NOT NULL DEFAULT false,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quests" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_quests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "quest_id" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");

-- CreateIndex
CREATE INDEX "users_telegram_id_idx" ON "users"("telegram_id");

-- CreateIndex
CREATE INDEX "users_wallet_address_idx" ON "users"("wallet_address");

-- CreateIndex
CREATE INDEX "pixegotchis_user_id_idx" ON "pixegotchis"("user_id");

-- CreateIndex
CREATE INDEX "pixegotchis_status_idx" ON "pixegotchis"("status");

-- CreateIndex
CREATE INDEX "inventory_user_id_idx" ON "inventory"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_user_id_item_id_key" ON "inventory"("user_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "items_item_id_key" ON "items"("item_id");

-- CreateIndex
CREATE INDEX "items_item_type_idx" ON "items"("item_type");

-- CreateIndex
CREATE INDEX "items_rarity_idx" ON "items"("rarity");

-- CreateIndex
CREATE INDEX "item_usage_history_user_id_pixegotchi_id_idx" ON "item_usage_history"("user_id", "pixegotchi_id");

-- CreateIndex
CREATE INDEX "item_usage_history_item_id_idx" ON "item_usage_history"("item_id");

-- CreateIndex
CREATE INDEX "item_usage_history_used_at_idx" ON "item_usage_history"("used_at");

-- CreateIndex
CREATE INDEX "vault_user_id_idx" ON "vault"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vault_user_id_pixegotchi_id_key" ON "vault"("user_id", "pixegotchi_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_is_active_listing_type_idx" ON "marketplace_listings"("is_active", "listing_type");

-- CreateIndex
CREATE INDEX "marketplace_listings_seller_id_idx" ON "marketplace_listings"("seller_id");

-- CreateIndex
CREATE INDEX "game_sessions_user_id_idx" ON "game_sessions"("user_id");

-- CreateIndex
CREATE INDEX "game_sessions_pixegotchi_id_idx" ON "game_sessions"("pixegotchi_id");

-- CreateIndex
CREATE INDEX "game_sessions_created_at_idx" ON "game_sessions"("created_at");

-- CreateIndex
CREATE INDEX "user_quests_user_id_idx" ON "user_quests"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_quests_user_id_quest_id_key" ON "user_quests"("user_id", "quest_id");

-- AddForeignKey
ALTER TABLE "pixegotchis" ADD CONSTRAINT "pixegotchis_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_usage_history" ADD CONSTRAINT "item_usage_history_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("item_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_pixegotchi_id_fkey" FOREIGN KEY ("pixegotchi_id") REFERENCES "pixegotchis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_listings" ADD CONSTRAINT "marketplace_listings_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_pixegotchi_id_fkey" FOREIGN KEY ("pixegotchi_id") REFERENCES "pixegotchis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_quests" ADD CONSTRAINT "user_quests_quest_id_fkey" FOREIGN KEY ("quest_id") REFERENCES "quests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
