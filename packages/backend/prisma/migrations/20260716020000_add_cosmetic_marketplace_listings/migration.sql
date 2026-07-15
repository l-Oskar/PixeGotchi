ALTER TYPE "ListingType" ADD VALUE 'cosmetic';

ALTER TABLE "marketplace_listings"
ADD COLUMN "cosmetic_asset_id" VARCHAR(64);

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_cosmetic_asset_id_fkey"
FOREIGN KEY ("cosmetic_asset_id")
REFERENCES "cosmetic_assets"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX "marketplace_listings_cosmetic_asset_id_idx"
ON "marketplace_listings"("cosmetic_asset_id");
