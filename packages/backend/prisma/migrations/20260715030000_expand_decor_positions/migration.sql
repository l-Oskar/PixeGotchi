UPDATE "cosmetic_assets"
SET
  "allowed_positions" = ARRAY[10, 11]::INTEGER[],
  "updated_at" = CURRENT_TIMESTAMP
WHERE "id" IN ('yellow-lantern', 'bonsai-pot');
