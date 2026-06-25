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

## 4. Migrations

Run migrations only when you intentionally want to apply existing committed migrations:

```bash
BRANCH=build-config RUN_MIGRATIONS=1 ./scripts/deploy.sh
```

Do not use this until the existing server database has a clear migration/baseline plan.

## 5. If the server has local changes

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

## 6. Manual fallback commands

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

## 7. Useful environment variables for scripts

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
