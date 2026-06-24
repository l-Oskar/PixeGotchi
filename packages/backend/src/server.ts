import { buildApp } from "./app";
import { config } from "@/config/env";
import { prisma } from "@/database/prisma";
import { flushLogger, logger } from "@/config/logger";

let app: Awaited<ReturnType<typeof buildApp>> | undefined;
let isShuttingDown = false;

async function flushAndExit(exitCode: number): Promise<never> {
  try {
    await flushLogger();
  } finally {
    process.exit(exitCode);
  }
}

async function closeGracefully(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info({ event: "shutdown_started", signal }, "Closing gracefully");

  try {
    await app?.close();
    await prisma.$disconnect();
    logger.info({ event: "shutdown_completed", signal }, "Shutdown completed");
    await flushAndExit(0);
  } catch (error) {
    logger.fatal(
      { err: error, event: "shutdown_failed", signal },
      "Shutdown failed",
    );
    await flushAndExit(1);
  }
}

async function start() {
  try {
    app = await buildApp();

    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    app.log.info(
      {
        event: "server_started",
        port: config.port,
      },
      "Server started",
    );
  } catch (err) {
    logger.fatal({ err, event: "server_start_failed" }, "Server failed to start");
    await flushAndExit(1);
  }
}

process.once("SIGINT", () => void closeGracefully("SIGINT"));
process.once("SIGTERM", () => void closeGracefully("SIGTERM"));

process.once("uncaughtException", (error) => {
  logger.fatal({ err: error, event: "uncaught_exception" }, "Uncaught exception");
  void flushAndExit(1);
});

process.once("unhandledRejection", (reason) => {
  logger.fatal(
    { err: reason, event: "unhandled_rejection" },
    "Unhandled promise rejection",
  );
  void flushAndExit(1);
});

void start();
