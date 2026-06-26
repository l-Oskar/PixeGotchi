# Linux build and server deploy

This guide is for the current Docker dev-style backend setup. It is useful when local Docker Desktop on macOS is too slow or hangs during `npm ci`.

## 1. Push code to GitHub from your computer

From your development machine:

```bash
git status
git add .
git commit -m "Build config"
git push origin build-config
```

Use the real branch name if it is not `build-config`.

## 2. Test Docker build on a Linux computer

Install prerequisites on the Linux machine:

- Git
- Docker
- Docker Compose plugin

Clone or update the project:

```bash
git clone <repo-url> PixeGotchi
cd PixeGotchi
git checkout build-config
git pull --ff-only origin build-config
```

Create required env files before running Compose:

```bash
cp .env.example .env
cp packages/backend/.env.example packages/backend/.env
```

Fill real values in both files.

Then validate and build only the backend image:

```bash
./scripts/build.sh
```

If you intentionally want a clean Docker build:

```bash
NO_CACHE=1 ./scripts/build.sh
```

If this passes on Linux, the Docker image build path is OK.

## 3. Deploy on the server after GitHub push

On the server:

```bash
cd /path/to/PixeGotchi
BRANCH=build-config ./scripts/deploy.sh
```

The deploy script does this:

1. checks that the git working tree is clean;
2. fetches and fast-forwards the selected branch;
3. validates `docker-compose.yml`;
4. builds the backend Docker image;
5. recreates only Docker `node_modules` volumes so dependency changes from `package-lock.json` are applied;
6. generates Prisma client for the Docker runtime;
7. starts `postgres`, `redis`, and `backend`;
8. checks `/health`.

By default it does not run database migrations.

## 4. Database migrations

Main rule:

- create migrations only on a development machine;
- commit migration files to git;
- on the server, only apply committed migrations;
- do not run `prisma migrate dev` on the server.

### What creates migration files

This command creates new files in `packages/backend/prisma/migrations`:

```bash
npm run prisma:migrate:dev --workspace=packages/backend
```

Run it only locally or on a disposable development database.

These commands should not create new migration files:

```bash
npm run docker:generate
npm run prisma:migrate:deploy --workspace=packages/backend
BRANCH=build-config RUN_MIGRATIONS=1 ./scripts/deploy.sh
```

`prisma generate` creates the Prisma client in `packages/backend/src/generated/prisma`, which is ignored by git.

### Normal schema-change workflow

When you change `packages/backend/prisma/schema.prisma`:

1. Run a local dev database.
2. Create a migration locally:

   ```bash
   npm run prisma:migrate:dev --workspace=packages/backend
   ```

3. Check generated migration files:

   ```bash
   git status --short packages/backend/prisma/migrations
   ```

4. Review the SQL in the new migration directory.
5. Run verification:

   ```bash
   npm run build --workspace=@pixegotchi/backend
   npm run typecheck --workspace=@pixegotchi/backend
   npm run build
   ```

6. Commit both the Prisma schema and migration files:

   ```bash
   git add packages/backend/prisma/schema.prisma packages/backend/prisma/migrations
   git commit -m "Add database migration"
   git push origin build-config
   ```

7. Deploy on the server with migrations enabled:

   ```bash
   BRANCH=build-config RUN_MIGRATIONS=1 ./scripts/deploy.sh
   ```

### Existing server database / baseline

If the server already has tables and data, do not blindly create and apply an initial migration.

Before enabling migrations for the first time on an existing database, decide the baseline strategy:

- either create a baseline migration that represents the current schema and mark it as applied;
- or create a clean migration history before real production data matters.

Until that baseline is clear, deploy without migrations:

```bash
BRANCH=build-config ./scripts/deploy.sh
```

### Applying already committed migrations on the server

Run migrations only when you intentionally want to apply existing committed migrations:

```bash
BRANCH=build-config RUN_MIGRATIONS=1 ./scripts/deploy.sh
```

This runs `prisma migrate deploy` inside Docker. It applies migrations that already exist in git and should not create new migration files.

### If migration files appear on the server

If `deploy.sh` stops because the server working tree is dirty, check:

```bash
git status --short
git status --short packages/backend/prisma/migrations
```

If you see untracked migration files:

```text
?? packages/backend/prisma/migrations/...
```

then one of these happened:

- `prisma migrate dev` was run on the server;
- migration files were created manually;
- old uncommitted files already existed on the server.

Decision:

- if the migration is real, copy it back to the development machine, review it, commit it, and push it;
- if it is accidental, remove it from the server working tree.

Safe cleanup when you are sure server-local files are disposable:

```bash
git reset --hard HEAD
git clean -fd
```

Do not use `git clean -fdx` unless you understand the impact. `-x` can remove ignored local files such as `.env`, runtime logs, generated client, and other local-only artifacts.

## 5. Future development and server workflow

Use this loop while the project is still in active development:

1. Develop locally on `build-config` or a feature branch.
2. Run relevant checks:

   ```bash
   npm run build --workspace=@pixegotchi/backend
   npm run typecheck --workspace=@pixegotchi/backend
   npm run build --workspace=packages/frontend
   ```

3. If shared code changed, check shared too:

   ```bash
   npm run build --workspace=@pixegotchi/shared
   npm run typecheck --workspace=@pixegotchi/shared
   ```

4. If Prisma schema changed, create and commit a migration locally.
5. Commit and push to GitHub.
6. Test Docker build on a Linux machine when Docker Desktop on macOS is slow:

   ```bash
   ./scripts/build.sh
   ```

7. Deploy on the server:

   ```bash
   BRANCH=build-config ./scripts/deploy.sh
   ```

8. If this deploy includes committed database migrations:

   ```bash
   BRANCH=build-config RUN_MIGRATIONS=1 ./scripts/deploy.sh
   ```

Do not edit generated files manually:

- `packages/backend/src/generated/prisma`
- `packages/backend/dist`
- `packages/shared/dist`
- `packages/frontend/dist`

These are local/generated artifacts and should stay out of git.

## 6. If the server has local changes

Default deploy stops if the server working tree is dirty. This is intentional.

Check what changed:

```bash
git status
```

If you are sure the local changes are disposable:

```bash
BRANCH=build-config RESET_LOCAL_CHANGES=1 ./scripts/deploy.sh
```

This runs `git reset --hard HEAD` and `git clean -fd`, so use it carefully.

## 7. Manual fallback commands

If you want to run the steps manually:

```bash
git fetch origin build-config
git checkout build-config
git pull --ff-only origin build-config

docker compose config --quiet
docker compose build backend
docker compose stop backend
docker compose rm -f backend
docker volume rm pixegotchi_backend_node_modules pixegotchi_shared_node_modules || true
docker compose run --rm --no-deps backend sh -c "cd packages/backend && npx prisma generate"
docker compose up -d postgres redis backend
docker compose ps
docker compose logs --tail=200 backend
curl http://127.0.0.1:3000/health
```

To apply committed migrations manually:

```bash
docker compose run --rm backend sh -c "cd packages/backend && npx prisma migrate deploy"
```

## 8. Useful environment variables for scripts

```bash
BRANCH=build-config
REMOTE=origin
COMPOSE_FILE=docker-compose.yml
SERVICE=backend
NO_CACHE=1
RUN_MIGRATIONS=1
RESET_LOCAL_CHANGES=1
RESET_NODE_MODULES=1
HEALTH_URL=http://127.0.0.1:3000/health
```

Use only the variables you need.
