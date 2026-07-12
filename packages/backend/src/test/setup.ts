import { config as loadEnv } from "dotenv";
import { afterAll, beforeEach } from "vitest";
import type { prisma as prismaClient } from "@/database/prisma";
import type Redis from "ioredis";

loadEnv({ path: ".env.test" });
loadEnv({ path: ".env.test.example" });

const databaseUrl = process.env.DATABASE_URL;
const redisUrl = process.env.REDIS_URL;

if (!databaseUrl || !/test/i.test(databaseUrl) || !redisUrl) {
  throw new Error(
    "Refusing to run tests without a test DATABASE_URL and REDIS_URL.",
  );
}

const testRedisUrl = redisUrl;

async function getPrisma(): Promise<typeof prismaClient> {
  const module = await import("@/database/prisma");
  return module.prisma;
}

let redis: Redis | undefined;

async function getRedis() {
  if (!redis) {
    const RedisClient = (await import("ioredis")).default;
    redis = new RedisClient(testRedisUrl, {
      lazyConnect: true,
      connectTimeout: 2_000,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null,
    });

    await redis.connect();
  }

  return redis;
}

function needsDatabaseCleanup(context: { task?: { file?: { filepath?: string } } }) {
  const filepath = context.task?.file?.filepath ?? "";
  return !filepath.includes("/src/test/shared/");
}

beforeEach(async (context) => {
  if (!needsDatabaseCleanup(context)) {
    return;
  }

  const prisma = await getPrisma();
  const redis = await getRedis();

  try {
    await redis.flushdb();
  } catch (error) {
    throw new Error(
      `Failed to clean test Redis at ${testRedisUrl}. Start Redis or run the integration suite through docker-compose.test.yml.`,
      { cause: error },
    );
  }

  try {
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "active_effects",
        "chests",
        "room_cosmetic_placements",
        "user_room_loadouts",
        "user_cosmetics",
        "cosmetic_assets",
        "eggs",
        "game_sessions",
        "inventory",
        "item_usage_history",
        "items",
        "marketplace_listings",
        "pixegotchis",
        "quests",
        "user_quests",
        "users",
        "vault"
      RESTART IDENTITY CASCADE
    `);
  } catch (error) {
    throw new Error(
      "Failed to clean the test PostgreSQL database. Make sure PostgreSQL is running and run `npm run test:db:push --workspace=packages/backend` before the test suite.",
      { cause: error },
    );
  }
});

afterAll(async () => {
  const prisma = await getPrisma();

  if (redis?.status === "ready") {
    await redis.quit();
  } else {
    redis?.disconnect();
  }
  await prisma.$disconnect();
});
