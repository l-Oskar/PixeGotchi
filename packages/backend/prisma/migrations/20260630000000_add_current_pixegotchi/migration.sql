ALTER TABLE "users" ADD COLUMN "current_pixegotchi_id" INTEGER;

UPDATE "users" AS u
SET "current_pixegotchi_id" = current_pixe.id
FROM (
  SELECT DISTINCT ON ("user_id") id, "user_id"
  FROM "pixegotchis"
  WHERE status IN ('active', 'critical')
  ORDER BY "user_id", "hatched_at" DESC, id DESC
) AS current_pixe
WHERE u.id = current_pixe."user_id";

CREATE UNIQUE INDEX "users_current_pixegotchi_id_key" ON "users"("current_pixegotchi_id");

ALTER TABLE "users"
  ADD CONSTRAINT "users_current_pixegotchi_id_fkey"
  FOREIGN KEY ("current_pixegotchi_id")
  REFERENCES "pixegotchis"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;
