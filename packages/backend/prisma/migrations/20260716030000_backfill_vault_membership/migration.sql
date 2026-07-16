INSERT INTO "vault" (
  "user_id",
  "pixegotchi_id",
  "final_level",
  "stored_at"
)
SELECT
  "pixegotchis"."user_id",
  "pixegotchis"."id",
  "pixegotchis"."level",
  CURRENT_TIMESTAMP
FROM "pixegotchis"
WHERE "pixegotchis"."status" = 'vault'
ON CONFLICT ("user_id", "pixegotchi_id") DO NOTHING;
