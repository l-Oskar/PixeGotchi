import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import { config } from "@/config/env";
import Redis from "ioredis";
import { ZodError } from "zod";

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
import { chestRoutes } from "./modules/chest/chest.routes";
import { ChestGenerator } from "./utils/chest-generator";
import { logger } from "@/config/logger";
import { clientLogsRoutes } from "@/modules/client-logs/client-logs.routes";

function isZodValidationError(error: unknown): error is Error {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeError = error as {
    name?: unknown;
    issues?: unknown;
    errors?: unknown;
  };

  return (
    error instanceof ZodError ||
    maybeError.name === "ZodError" ||
    Array.isArray(maybeError.issues) ||
    Array.isArray(maybeError.errors)
  );
}

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
    disableRequestLogging: true,
    genReqId: () => randomUUID(),
    requestIdLogLabel: "requestId",
    trustProxy: config.nodeEnv === "production",
  });

  const redis = new Redis(config.redisUrl);

  app.addHook("onClose", async () => {
    await redis.quit();
  });

  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  app.addHook("onResponse", async (request, reply) => {
    const path = request.url.split("?", 1)[0] ?? request.url;

    if (path === "/health" || request.method === "OPTIONS") {
      return;
    }

    const logData = {
      event: "http_request_completed",
      request: {
        method: request.method,
        path: request.routeOptions.url ?? path,
      },
      response: {
        statusCode: reply.statusCode,
      },
      responseTimeMs: reply.elapsedTime,
    };

    if (reply.statusCode >= 500) {
      request.log.error(logData, "HTTP request completed");
      return;
    }

    if (reply.statusCode >= 400) {
      request.log.warn(logData, "HTTP request completed");
      return;
    }

    request.log.info(logData, "HTTP request completed");
  });

  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  await app.register(cors, {
    origin: [
      "https://l-oskar.github.io",
      "https://pixegotchi.run.place",
      "http://localhost:5173",
    ],
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
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.setErrorHandler((error: any, request: any, reply: any) => {
    request.log.error(
      {
        err: error,
        event: "request_failed",
      },
      "Request failed",
    );

    if (error.name === "PrismaClientKnownRequestError") {
      return reply.code(400).send({
        error: "Database error",
        message: error.message,
      });
    }

    if (isZodValidationError(error)) {
      return reply.code(400).send({
        error: "Validation error",
        message: error.message,
      });
    }

    reply.code(error.statusCode || 500).send({
      error: error.message || "Internal Server Error",
    });
  });

  app.get("/", async () => {
    return {
      status: "ok",
      message: "Welcome to api",
    };
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

  app.get("/chests", async () => {
    return ChestGenerator.statistic();
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
      await apiInstance.register(chestRoutes, { prefix: "/chest" });
      await apiInstance.register(clientLogsRoutes, { prefix: "/logs" });
    },
    { prefix: "/api" },
  );

  return app;
}
