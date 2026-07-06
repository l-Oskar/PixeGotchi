# Development setup

This project is an npm workspaces monorepo:

- `packages/frontend` — Vite/React frontend.
- `packages/backend` — Fastify API.
- `packages/shared` — shared types, constants, and game logic.

## First install

Use Node.js 22 and npm 11 from the repository root:

```bash
npm install
```

## Local frontend

```bash
npm run frontend:dev
```

Frontend production build/deploy to GitHub Pages stays in `packages/frontend`:

```bash
npm run build --workspace=packages/frontend
npm run deploy --workspace=packages/frontend
```

## Frontend state ownership

- Store UI/runtime state in Zustand stores under `packages/frontend/src/store`.
- Use Zustand for app preferences, theme state, open menus, selected UI modes, and client-only state that should be shared across components.
- Store API/server data in TanStack Query hooks under `packages/frontend/src/services/queries`.
- Data returned by the backend should live in the TanStack Query cache. Update it with invalidation or `queryClient.setQueryData`; do not copy it into Zustand unless there is a deliberate compatibility bridge.

## Local backend without Docker

Start PostgreSQL and Redis separately, configure `packages/backend/.env`, then run:

```bash
npm run backend:dev
```

`backend:dev` runs Prisma client generation first through `predev`, then starts the backend watcher.

Backend dev does not emit JavaScript next to TypeScript files. It watches TypeScript with `tsup` and runs compiled output from:

```text
packages/backend/dist/server.js
```

## Docker dev stack

Start PostgreSQL, Redis, and backend:

```bash
npm run docker:dev
```

The backend service uses bind mounts for source code and Docker volumes for container `node_modules`. This is intentional: native packages such as `esbuild` must stay Linux-built inside Docker and must not be overwritten by macOS `node_modules`.

Useful commands:

```bash
npm run docker:build
npm run docker:down
npm run docker:studio
```

## Prisma in dev

Generate the Prisma client manually when the schema changes or after a clean setup:

```bash
npm run docker:generate
```

Create a local development migration only when you intentionally change the database schema:

```bash
npm run prisma:migrate:dev --workspace=packages/backend
```

Apply existing migrations to a deployed/staging database:

```bash
npm run prisma:migrate:deploy --workspace=packages/backend
```

Do not run production/deployed migrations automatically from Docker dev startup.

## Verification

Backend:

```bash
npm run build --workspace=@pixegotchi/backend
npm run typecheck --workspace=@pixegotchi/backend
```

Shared:

```bash
npm run build --workspace=@pixegotchi/shared
npm run typecheck --workspace=@pixegotchi/shared
```

Full workspace:

```bash
npm run build
npm run typecheck
```

Docker health check:

```bash
docker compose ps
curl http://127.0.0.1:3000/health
```

## Important notes

- `packages/shared` has two build modes:
  - `build` — full package build with declarations.
  - `build:dev` — fast JavaScript-only build used by Docker dev startup.
- `packages/backend/generated/prisma` was replaced by `packages/backend/src/generated/prisma`.
- `src/generated` is generated code and should not be committed.
- `dist`, `build`, runtime logs, `.env` files, and generated Prisma client output should stay out of git.
