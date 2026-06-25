# Prisma migrations

Create development migrations with `npm run prisma:migrate:dev` and commit the
generated migration directories.

Production and staging must only run `npm run prisma:migrate:deploy`.

The existing production database must be baselined before the first migration
is deployed. Do not apply a generated initial migration to an existing schema
without completing that baseline.
