/*
  Warnings:

  - The values [chest] on the enum `ListingType` will be removed. If these variants are still used in the database, this will fail.
  - The values [egg] on the enum `PixegotchiStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tmc_earned` on the `game_sessions` table. All the data in the column will be lost.
  - You are about to drop the column `nft_address` on the `marketplace_listings` table. All the data in the column will be lost.
  - You are about to drop the column `cleanliness_rate` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `disease_resistance` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `energy_rate` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `happines_rate` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `hatched_at` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `hunger_rate` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `life_recovery_rate` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to drop the column `lives` on the `pixegotchis` table. All the data in the column will be lost.
  - You are about to alter the column `health` on the `pixegotchis` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `hunger` on the `pixegotchis` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `energy` on the `pixegotchis` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `happiness` on the `pixegotchis` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - You are about to alter the column `cleanliness` on the `pixegotchis` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(5,2)`.
  - Made the column `element` on table `pixegotchis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rarity` on table `pixegotchis` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gender` on table `pixegotchis` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "ItemType" ADD VALUE 'resurrection';

-- AlterEnum
BEGIN;
CREATE TYPE "ListingType_new" AS ENUM ('egg', 'pixegotchi', 'item');
ALTER TABLE "marketplace_listings" ALTER COLUMN "listing_type" TYPE "ListingType_new" USING ("listing_type"::text::"ListingType_new");
ALTER TYPE "ListingType" RENAME TO "ListingType_old";
ALTER TYPE "ListingType_new" RENAME TO "ListingType";
DROP TYPE "public"."ListingType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PixegotchiStatus_new" AS ENUM ('active', 'critical', 'vault', 'dead');
ALTER TABLE "public"."pixegotchis" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "pixegotchis" ALTER COLUMN "status" TYPE "PixegotchiStatus_new" USING ("status"::text::"PixegotchiStatus_new");
ALTER TYPE "PixegotchiStatus" RENAME TO "PixegotchiStatus_old";
ALTER TYPE "PixegotchiStatus_new" RENAME TO "PixegotchiStatus";
DROP TYPE "public"."PixegotchiStatus_old";
ALTER TABLE "pixegotchis" ALTER COLUMN "status" SET DEFAULT 'active';
COMMIT;

-- AlterTable
ALTER TABLE "game_sessions" DROP COLUMN "tmc_earned",
ADD COLUMN     "energy_spent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "experience_gained" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "items_dropped" JSONB,
ADD COLUMN     "pgc_earned" DECIMAL(20,8) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "marketplace_listings" DROP COLUMN "nft_address",
ADD COLUMN     "egg_id" INTEGER,
ADD COLUMN     "pixegotchi_id" INTEGER,
ALTER COLUMN "currency" SET DEFAULT 'pgc';

-- AlterTable
ALTER TABLE "pixegotchis" DROP COLUMN "cleanliness_rate",
DROP COLUMN "disease_resistance",
DROP COLUMN "energy_rate",
DROP COLUMN "happines_rate",
DROP COLUMN "hatched_at",
DROP COLUMN "hunger_rate",
DROP COLUMN "life_recovery_rate",
DROP COLUMN "lives",
ADD COLUMN     "critical_since" TIMESTAMP(3),
ALTER COLUMN "genome_hash" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "status" SET DEFAULT 'active',
ALTER COLUMN "element" SET NOT NULL,
ALTER COLUMN "rarity" SET NOT NULL,
ALTER COLUMN "gender" SET NOT NULL,
ALTER COLUMN "health" SET DEFAULT 100,
ALTER COLUMN "health" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "hunger" SET DEFAULT 70,
ALTER COLUMN "hunger" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "energy" SET DEFAULT 100,
ALTER COLUMN "energy" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "happiness" SET DEFAULT 50,
ALTER COLUMN "happiness" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "cleanliness" SET DEFAULT 100,
ALTER COLUMN "cleanliness" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_active_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "eggs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "is_listed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eggs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "active_effects" (
    "id" SERIAL NOT NULL,
    "pixegotchi_id" INTEGER NOT NULL,
    "effectType" VARCHAR(50) NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "active_effects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "eggs_user_id_idx" ON "eggs"("user_id");

-- CreateIndex
CREATE INDEX "eggs_is_listed_idx" ON "eggs"("is_listed");

-- CreateIndex
CREATE INDEX "active_effects_pixegotchi_id_idx" ON "active_effects"("pixegotchi_id");

-- CreateIndex
CREATE INDEX "active_effects_expires_at_idx" ON "active_effects"("expires_at");

-- CreateIndex
CREATE INDEX "marketplace_listings_egg_id_idx" ON "marketplace_listings"("egg_id");

-- CreateIndex
CREATE INDEX "marketplace_listings_pixegotchi_id_idx" ON "marketplace_listings"("pixegotchi_id");

-- CreateIndex
CREATE INDEX "pixegotchis_rarity_idx" ON "pixegotchis"("rarity");

-- CreateIndex
CREATE INDEX "pixegotchis_element_idx" ON "pixegotchis"("element");

-- AddForeignKey
ALTER TABLE "eggs" ADD CONSTRAINT "eggs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "active_effects" ADD CONSTRAINT "active_effects_pixegotchi_id_fkey" FOREIGN KEY ("pixegotchi_id") REFERENCES "pixegotchis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
