ALTER TYPE "RoomCosmeticSlot" ADD VALUE IF NOT EXISTS 'sofa';

UPDATE "cosmetic_assets"
SET
  "slot" = 'sofa',
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" IN ('purple-sofa', 'blue-sofa');
