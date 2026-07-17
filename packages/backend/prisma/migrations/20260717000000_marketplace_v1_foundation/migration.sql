ALTER TYPE "CurrencyType" ADD VALUE IF NOT EXISTS 'stars';

CREATE TYPE "MarketplaceListingStatus" AS ENUM (
  'active',
  'sold',
  'cancelled',
  'expired'
);

CREATE TYPE "MarketplaceTreasuryTransactionType" AS ENUM (
  'commission',
  'distribution'
);

ALTER TABLE "items"
ADD COLUMN "is_tradable" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "pixegotchis"
ADD COLUMN "is_listed" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "pixegotchis_is_listed_status_level_idx"
ON "pixegotchis"("is_listed", "status", "level");

CREATE INDEX "items_is_tradable_item_type_idx"
ON "items"("is_tradable", "item_type");

ALTER TABLE "marketplace_listings"
DROP CONSTRAINT IF EXISTS "marketplace_listings_buyer_id_fkey";

ALTER TABLE "marketplace_listings"
RENAME COLUMN "quantity" TO "initial_quantity";

ALTER TABLE "marketplace_listings"
RENAME COLUMN "price" TO "unit_price";

ALTER TABLE "marketplace_listings"
ADD COLUMN "chest_type" "ChestType",
ADD COLUMN "remaining_quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "status" "MarketplaceListingStatus" NOT NULL DEFAULT 'active',
ADD COLUMN "expires_at" TIMESTAMP(3),
ADD COLUMN "closed_at" TIMESTAMP(3);

UPDATE "marketplace_listings"
SET
  "remaining_quantity" = CASE
    WHEN "is_active" THEN "initial_quantity"
    ELSE 0
  END,
  "status" = CASE
    WHEN "is_active" THEN 'active'::"MarketplaceListingStatus"
    WHEN "buyer_id" IS NOT NULL OR "sold_at" IS NOT NULL
      THEN 'sold'::"MarketplaceListingStatus"
    ELSE 'cancelled'::"MarketplaceListingStatus"
  END,
  "expires_at" = "created_at" + INTERVAL '7 days',
  "closed_at" = CASE
    WHEN "is_active" THEN NULL
    ELSE COALESCE("sold_at", "created_at")
  END;

ALTER TABLE "marketplace_listings"
ALTER COLUMN "expires_at" SET NOT NULL;

ALTER TABLE "marketplace_listings"
DROP COLUMN "buyer_id",
DROP COLUMN "is_active",
DROP COLUMN "sold_at";

DROP INDEX IF EXISTS "marketplace_listings_is_active_listing_type_idx";
DROP INDEX IF EXISTS "marketplace_listings_seller_id_idx";

CREATE INDEX "marketplace_listings_status_listing_type_idx"
ON "marketplace_listings"("status", "listing_type");

CREATE INDEX "marketplace_listings_seller_id_status_idx"
ON "marketplace_listings"("seller_id", "status");

CREATE INDEX "marketplace_listings_status_expires_at_idx"
ON "marketplace_listings"("status", "expires_at");

CREATE INDEX "marketplace_listings_item_id_idx"
ON "marketplace_listings"("item_id");

CREATE INDEX "marketplace_listings_chest_type_idx"
ON "marketplace_listings"("chest_type");

ALTER TABLE "marketplace_listings"
DROP CONSTRAINT IF EXISTS "marketplace_listings_egg_id_fkey";

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_egg_id_fkey"
FOREIGN KEY ("egg_id")
REFERENCES "eggs"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_listings"
DROP CONSTRAINT IF EXISTS "marketplace_listings_pixegotchi_id_fkey";

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_pixegotchi_id_fkey"
FOREIGN KEY ("pixegotchi_id")
REFERENCES "pixegotchis"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_listings"
DROP CONSTRAINT IF EXISTS "marketplace_listings_item_id_fkey";

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_item_id_fkey"
FOREIGN KEY ("item_id")
REFERENCES "items"("item_id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_quantity_check"
CHECK (
  "initial_quantity" > 0
  AND "remaining_quantity" >= 0
  AND "remaining_quantity" <= "initial_quantity"
) NOT VALID;

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_unit_price_check"
CHECK ("unit_price" >= 1 AND "unit_price" <= 1000000000) NOT VALID;

ALTER TABLE "marketplace_listings"
ADD CONSTRAINT "marketplace_listings_asset_check"
CHECK (
  (
    "listing_type" = 'egg'::"ListingType"
    AND "egg_id" IS NOT NULL
    AND "pixegotchi_id" IS NULL
    AND "item_id" IS NULL
    AND "chest_type" IS NULL
    AND "cosmetic_asset_id" IS NULL
    AND "initial_quantity" = 1
  )
  OR (
    "listing_type" = 'pixegotchi'::"ListingType"
    AND "egg_id" IS NULL
    AND "pixegotchi_id" IS NOT NULL
    AND "item_id" IS NULL
    AND "chest_type" IS NULL
    AND "cosmetic_asset_id" IS NULL
    AND "initial_quantity" = 1
  )
  OR (
    "listing_type" = 'item'::"ListingType"
    AND "egg_id" IS NULL
    AND "pixegotchi_id" IS NULL
    AND "item_id" IS NOT NULL
    AND "chest_type" IS NULL
    AND "cosmetic_asset_id" IS NULL
  )
  OR (
    "listing_type" = 'chest'::"ListingType"
    AND "egg_id" IS NULL
    AND "pixegotchi_id" IS NULL
    AND "item_id" IS NULL
    AND "chest_type" IS NOT NULL
    AND "cosmetic_asset_id" IS NULL
  )
  OR (
    "listing_type" = 'cosmetic'::"ListingType"
    AND "egg_id" IS NULL
    AND "pixegotchi_id" IS NULL
    AND "item_id" IS NULL
    AND "chest_type" IS NULL
    AND "cosmetic_asset_id" IS NOT NULL
    AND "initial_quantity" = 1
  )
) NOT VALID;

ALTER TABLE "chests"
ADD COLUMN "marketplace_listing_id" INTEGER;

ALTER TABLE "chests"
ADD CONSTRAINT "chests_marketplace_listing_id_fkey"
FOREIGN KEY ("marketplace_listing_id")
REFERENCES "marketplace_listings"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "chests_marketplace_listing_id_idx"
ON "chests"("marketplace_listing_id");

CREATE TABLE "marketplace_purchases" (
  "id" SERIAL NOT NULL,
  "listing_id" INTEGER NOT NULL,
  "buyer_id" INTEGER NOT NULL,
  "seller_id" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unit_price" DECIMAL(20,8) NOT NULL,
  "subtotal" DECIMAL(20,8) NOT NULL,
  "commission_bps" INTEGER NOT NULL,
  "commission_amount" DECIMAL(20,8) NOT NULL,
  "seller_proceeds" DECIMAL(20,8) NOT NULL,
  "currency" "CurrencyType" NOT NULL DEFAULT 'pgc',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "marketplace_purchases_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "marketplace_purchases_values_check" CHECK (
    "quantity" > 0
    AND "unit_price" >= 1
    AND "subtotal" > 0
    AND "commission_bps" >= 0
    AND "commission_amount" >= 0
    AND "seller_proceeds" >= 0
    AND "commission_amount" + "seller_proceeds" = "subtotal"
  )
);

ALTER TABLE "marketplace_purchases"
ADD CONSTRAINT "marketplace_purchases_listing_id_fkey"
FOREIGN KEY ("listing_id")
REFERENCES "marketplace_listings"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_purchases"
ADD CONSTRAINT "marketplace_purchases_buyer_id_fkey"
FOREIGN KEY ("buyer_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_purchases"
ADD CONSTRAINT "marketplace_purchases_seller_id_fkey"
FOREIGN KEY ("seller_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX "marketplace_purchases_listing_id_idx"
ON "marketplace_purchases"("listing_id");

CREATE INDEX "marketplace_purchases_buyer_id_created_at_idx"
ON "marketplace_purchases"("buyer_id", "created_at");

CREATE INDEX "marketplace_purchases_seller_id_created_at_idx"
ON "marketplace_purchases"("seller_id", "created_at");

CREATE TABLE "marketplace_treasury_balances" (
  "currency" "CurrencyType" NOT NULL,
  "balance" DECIMAL(20,8) NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "marketplace_treasury_balances_pkey" PRIMARY KEY ("currency"),
  CONSTRAINT "marketplace_treasury_balances_non_negative_check"
    CHECK ("balance" >= 0)
);

INSERT INTO "marketplace_treasury_balances" ("currency", "balance")
VALUES ('pgc', 0);

CREATE TABLE "marketplace_treasury_transactions" (
  "id" SERIAL NOT NULL,
  "transaction_type" "MarketplaceTreasuryTransactionType" NOT NULL,
  "currency" "CurrencyType" NOT NULL DEFAULT 'pgc',
  "amount" DECIMAL(20,8) NOT NULL,
  "balance_after" DECIMAL(20,8) NOT NULL,
  "purchase_id" INTEGER,
  "admin_user_id" INTEGER,
  "recipient_user_id" INTEGER,
  "reason" VARCHAR(200),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "marketplace_treasury_transactions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "marketplace_treasury_transactions_purchase_id_key"
    UNIQUE ("purchase_id"),
  CONSTRAINT "marketplace_treasury_transactions_values_check" CHECK (
    "amount" > 0
    AND "balance_after" >= 0
    AND (
      (
        "transaction_type" = 'commission'::"MarketplaceTreasuryTransactionType"
        AND "purchase_id" IS NOT NULL
        AND "admin_user_id" IS NULL
        AND "recipient_user_id" IS NULL
      )
      OR (
        "transaction_type" = 'distribution'::"MarketplaceTreasuryTransactionType"
        AND "purchase_id" IS NULL
        AND "admin_user_id" IS NOT NULL
        AND "recipient_user_id" IS NOT NULL
        AND "reason" IS NOT NULL
      )
    )
  )
);

ALTER TABLE "marketplace_treasury_transactions"
ADD CONSTRAINT "marketplace_treasury_transactions_purchase_id_fkey"
FOREIGN KEY ("purchase_id")
REFERENCES "marketplace_purchases"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_treasury_transactions"
ADD CONSTRAINT "marketplace_treasury_transactions_admin_user_id_fkey"
FOREIGN KEY ("admin_user_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "marketplace_treasury_transactions"
ADD CONSTRAINT "marketplace_treasury_transactions_recipient_user_id_fkey"
FOREIGN KEY ("recipient_user_id")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX "marketplace_treasury_transactions_currency_created_at_idx"
ON "marketplace_treasury_transactions"("currency", "created_at");

CREATE INDEX "marketplace_treasury_transactions_recipient_user_id_created_at_idx"
ON "marketplace_treasury_transactions"("recipient_user_id", "created_at");
