import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import pino, { type DestinationStream, type Logger } from "pino";

const environment = process.env.NODE_ENV ?? "development";
const isDevelopment = environment === "development";
const logToFile = process.env.LOG_TO_FILE === "true";
const logFilePath =
  process.env.LOG_FILE_PATH ?? "/var/log/pixegotchi/backend.log";

const streams: DestinationStream[] = [];

if (isDevelopment) {
  streams.push(
    pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss Z",
      },
    }),
  );
} else {
  streams.push(pino.destination(1));
}

if (logToFile) {
  mkdirSync(dirname(logFilePath), { recursive: true });
  streams.push(
    pino.destination({
      dest: logFilePath,
      mkdir: true,
      sync: false,
    }),
  );
}

export const logger: Logger = pino(
  {
    level: process.env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
    base: {
      service: "backend",
      environment,
      version: process.env.APP_VERSION ?? "development",
    },
    mixin: () => ({ source: "backend" }),
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        "authorization",
        "cookie",
        "password",
        "token",
        "accessToken",
        "refreshToken",
        "jwt",
        "initData",
        "telegramInitData",
        "databaseUrl",
        "DATABASE_URL",
        "req.headers.authorization",
        "req.headers.cookie",
        "req.body.password",
        "req.body.token",
        "req.body.initData",
        "headers.authorization",
        "headers.cookie",
      ],
      censor: "[REDACTED]",
    },
    serializers: {
      err: pino.stdSerializers.err,
    },
  },
  pino.multistream(streams),
);

export function flushLogger(): Promise<void> {
  return new Promise((resolve, reject) => {
    logger.flush((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}
