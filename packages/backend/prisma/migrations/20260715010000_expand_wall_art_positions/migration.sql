UPDATE "cosmetic_assets"
SET
  "allowed_positions" = ARRAY[1, 3]::INTEGER[],
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = 'botanical-frame';
