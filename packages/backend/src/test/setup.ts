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
    redis = new RedisClient(testRedisUrl);
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

    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "active_effects",
        "chests",
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
      "Failed to clean the test database. Make sure PostgreSQL is running and run `npm run test:db:push --workspace=packages/backend` before the test suite.",
      { cause: error },
    );
  }
});

afterAll(async () => {
  const prisma = await getPrisma();

  await redis?.quit();
  await prisma.$disconnect();
});
