ALTER TABLE "cosmetic_assets"
ADD COLUMN "is_chest_reward" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "chest_drop_weight" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "cosmetic_assets_is_chest_reward_is_active_idx"
ON "cosmetic_assets"("is_chest_reward", "is_active");

UPDATE "cosmetic_assets"
SET
  "is_chest_reward" = true,
  "chest_drop_weight" = 100
WHERE "id" = 'blue-sofa';
