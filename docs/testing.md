# Testing Guide

This project starts testing with backend core behavior first. The goal is to catch regressions in current shipped logic without treating unfinished roadmap areas as failures.

## Test Types

- Shared pure logic tests cover deterministic helpers from `@pixegotchi/shared`, such as genome validation, item parsing, stat math, and exp math.
- Backend service tests run against a real test PostgreSQL database through Prisma. Use these for transactions, constraints, inventory changes, egg hatching, and Pixegotchi stat logic.
- Backend route tests use Fastify `app.inject()`. Do not start a real HTTP server for route tests.
- Frontend and E2E tests are intentionally out of scope for the first testing pass.

## Test Environment

This section is for local host-based test runs where Node/npm are installed on the machine. For the server path without host Node/npm, use `Server Test Deploy` below.

1. Copy `packages/backend/.env.test.example` to `packages/backend/.env.test`.
2. Keep `DATABASE_URL` pointed at a database created only for tests, for example `pixegotchi_test`.
3. Keep `NODE_ENV=test`, `LOG_LEVEL=silent`, and `LOG_TO_FILE=false`.
4. Never point `.env.test` at development, staging, or production data.

The test setup refuses to run unless `DATABASE_URL` clearly looks like a test database URL.

## Test Database

The repository currently has a Prisma schema but no real migration history. Because of that, initialize or refresh the test database with:

```sh
npm run test:db:push --workspace=packages/backend
```

Use `prisma db push` for the test database. Do not use `prisma migrate deploy` until real migrations exist.

PostgreSQL and Redis can be local services or the existing Docker Compose services. The route tests build the Fastify app, so Redis should be available when running the full backend test suite.

## Test Data

There is no global seed for the test database. Each test creates the records it needs through factory helpers in `packages/backend/src/test/helpers/factories.ts`.

This keeps tests isolated:

- the setup truncates test tables before each test;
- service tests create their own user, egg, item, inventory, and Pixegotchi records;
- test results do not depend on test order or on data left by another test.

## Docker Test Run

For a repeatable server run, use the isolated test Compose file. It starts a separate PostgreSQL database, a separate Redis instance, pushes the Prisma schema, and runs the backend Vitest suite in a one-off container.

This Docker path does not require Node or npm on the host. The host only needs `git`, Docker, and Docker Compose. Node/npm run inside the backend Docker image.

```sh
docker compose -f docker-compose.test.yml --profile test up --build --abort-on-container-exit --exit-code-from backend-test backend-test
```

After the test image has been built once, code-only changes can run without rebuilding:

```sh
docker compose -f docker-compose.test.yml --profile test up --no-build --abort-on-container-exit --exit-code-from backend-test backend-test
```

Use `--build` again when `package.json`, `package-lock.json`, the backend Dockerfile, or dependency setup changes.

Clean the test containers and test database volume:

```sh
docker compose -f docker-compose.test.yml --profile test down -v
```

This path does not use the normal `postgres`, `redis`, or `backend` services from `docker-compose.yml`. It uses `docker-compose.test.yml` and the `test` profile.

## Server Test Deploy

On a weak server, do not keep the main app stack and the test stack running at the same time. Use the server script:

```sh
./scripts/test-deploy.sh
```

The script does this in order:

1. Refuses to run if the server checkout has local git changes.
2. Stops the main `docker-compose.yml` stack.
3. Runs `git fetch`, `git checkout`, and `git pull --ff-only`.
4. Starts the isolated `docker-compose.test.yml` stack and runs backend tests.
5. Removes the test stack and its test database volume.
6. Starts the main `docker-compose.yml` stack again.

The main stack is started again even if tests fail. That behavior is handled by a shell `trap`.

Useful options:

```sh
BRANCH=main ./scripts/test-deploy.sh
TEST_BUILD=1 ./scripts/test-deploy.sh
SKIP_PULL=1 ./scripts/test-deploy.sh
RESTART_APP=0 ./scripts/test-deploy.sh
COMPOSE_FILE=docker-compose.yml TEST_COMPOSE_FILE=docker-compose.test.yml ./scripts/test-deploy.sh
```

`TEST_BUILD` defaults to `0`, so the server script uses `--no-build` by default. Run with `TEST_BUILD=1` for the first run, after dependency changes, or after Dockerfile changes. The test compose mounts `packages/backend` and `packages/shared`, so pulled code changes are visible to the test container even without rebuilding the image.

## Commands

These commands are for local development machines with Node/npm installed. Do not use them as the server deploy path.

Run backend tests:

```sh
npm run test --workspace=packages/backend
```

Run tests in watch mode:

```sh
npm run test:watch --workspace=packages/backend
```

Run coverage:

```sh
npm run test:coverage --workspace=packages/backend
```

After backend changes, run these checks in this order:

```sh
npm run test --workspace=packages/backend
npm run typecheck --workspace=packages/backend
npm run build --workspace=packages/backend
```

Run backend `typecheck` and `build` sequentially. Both can trigger Prisma generation, and parallel runs can corrupt or race the generated Prisma client.

## Writing Service Tests

- Put service tests beside the service under `packages/backend/src/modules/**`.
- Use factories from `packages/backend/src/test/helpers/factories.ts` for users, eggs, items, inventory, and Pixegotchi records.
- Test behavior through the public service method when possible.
- Assert database side effects after the method resolves.
- Keep every test independent. The setup truncates all tables before each test.

Good service test targets:

- `EggService.createEgg`: balance decrement, egg creation, insufficient funds.
- `EggService.startHatching/hatchEgg`: listed eggs, already-hatched eggs, not-ready eggs, active Pixegotchi conflicts, successful hatch.
- `Inventory.addItem/consumeItem/useItem`: increments, exact delete, insufficient quantity, usage history writes.
- `PixegotchiService.applyStats/addExp/checkStatus`: stat clamping, exp and level updates, null-safe status.

## Writing Route Tests

- Build the app with `const app = await buildApp()`.
- Send requests with `app.inject()`.
- Close the app in `afterEach` with `await app.close()`.
- For protected routes, create a token with `app.jwt.sign({ userId })`.
- Route tests should verify HTTP status and response shape, not duplicate every service test.

Example checks:

- `/health` returns `200`.
- Protected routes without JWT return `401`.
- Invalid payloads return `400`, not `500`.

## Safety Rules

- Do not run integration tests against non-test data.
- Do not include Games or Marketplace as required behavior until those features are considered shipped.
- Do not run `scripts/test.js` as part of unit or integration testing. It is a manual production health stress script.
