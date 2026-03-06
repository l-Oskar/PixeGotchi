import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { prisma } from "@/database/prisma";
import { config } from "@/config/env";
import Redis from "ioredis";

import { authRoutes } from "@/modules/auth/auth.routes";
import { usersRoutes } from "@/modules/users/users.routes";
import { pixegotchiRoutes } from "@/modules/pixegotchi/pixegotchi.routes";
import { inventoryRoutes } from "@/modules/inventory/inventory.routes";
import { gamesRoutes } from "@/modules/games/games.routes";
import { marketplaceRoutes } from "@/modules/marketplace/marketplace.routes";
import { vaultRoutes } from "@/modules/vault/vault.routes";
import { eggsRoutes } from "./modules/eggs/eggs.routes";
import { GenomeGenerator } from "./utils/genome-generator";
import { itemsRoutes } from "./modules/items/items.routes";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      transport:
        config.nodeEnv === "development"
          ? {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
                colorize: true,
              },
            }
          : undefined,
    },
  });

  const redis = new Redis(config.redisUrl);

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: true,
    credentials: false,
  });

  await app.register(jwt, {
    secret: config.jwtSecret,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
    redis,
  });

  app.decorate("authenticate", async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      timeStamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  app.get("/stats", async () => {
    return {
      title: "Pixegotchi generator Statistic",
      statistic: await GenomeGenerator.getStats(),
    };
  });

  await app.register(
    async (apiInstance) => {
      await apiInstance.register(authRoutes, { prefix: "/auth" });
      await apiInstance.register(usersRoutes, { prefix: "/users" });
      await apiInstance.register(pixegotchiRoutes, {
        prefix: "/pixegotchi",
      });
      await apiInstance.register(eggsRoutes, { prefix: "/eggs" });
      await apiInstance.register(inventoryRoutes, { prefix: "/inventory" });
      await apiInstance.register(itemsRoutes, { prefix: "/items" });
      await apiInstance.register(gamesRoutes, { prefix: "/games" });
      await apiInstance.register(marketplaceRoutes, {
        prefix: "/marketplace",
      });
      await apiInstance.register(vaultRoutes, { prefix: "/vault" });
    },
    { prefix: "/api" },
  );

  app.setErrorHandler((error: any, reply: any) => {
    app.log.error(error);

    if (error.name === "PrismaClientKnownRequestError") {
      return reply.code(400).send({
        error: "Database error",
        message: error.message,
      });
    }

    if (error.name === "ZodError") {
      return reply.code(400).send({
        error: "Validation error",
        message: error.message,
      });
    }

    reply.code(error.statusCode || 500).send({
      error: error.message || "Internal Server Error",
    });
  });

  const closeGracefully = async (signal: string) => {
    app.log.info(`Received signal "${signal}", closing gracefully...`),
      await app.close(),
      await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => closeGracefully("SIGINT"));
  process.on("SIGTERM", () => closeGracefully("SIGTERM"));

  return app;
}
