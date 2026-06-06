import path from "path";
import winston, { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const isDevelopment = process.env.NODE_ENV !== "production";

const logsDir = path.resolve(process.cwd(), "logs");

const serviceColors: Record<string, string> = {
  frontend: "\x1b[35m",
  backend: "\x1b[36m",
};

const resetColor = "\x1b[0m";

const createConsoleFormat = () =>
  format.combine(
    format.timestamp({
      format: "DD-MM-YYYY HH:mm:ss.SSS",
    }),

    format.errors({
      stack: true,
    }),

    format.printf(({ level, service, message, timestamp, stack }) => {
      const serviceColor =
        serviceColors[service as keyof typeof serviceColors] || "";

      return `[${timestamp}] [${serviceColor}${service}${resetColor}] ${level}: ${
        stack || message
      }`;
    }),
  );

const createFileFormat = () =>
  format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss.SSS",
    }),

    format.errors({
      stack: true,
    }),

    format.printf(({ level, service, message, timestamp, stack }) => {
      return `[${timestamp}] [${service}] ${level}: ${stack || message}`;
    }),
  );

export const createLogger = (service: string) => {
  return winston.createLogger({
    level: isDevelopment ? "debug" : "info",

    defaultMeta: {
      service,
    },

    exitOnError: false,

    transports: [
      //
      // CONSOLE
      //
      new winston.transports.Console({
        format: isDevelopment
          ? format.combine(
              format.colorize({
                all: true,
              }),
              createConsoleFormat(),
            )
          : format.combine(format.uncolorize(), format.json()),
      }),

      //
      // ALL LOGS
      //
      new DailyRotateFile({
        dirname: logsDir,

        filename: "combined-%DATE%.log",

        datePattern: "YYYY-MM-DD",

        zippedArchive: true,

        maxSize: "20m",

        maxFiles: "14d",

        level: isDevelopment ? "debug" : "info",

        format: createFileFormat(),
      }),

      //
      // ERROR LOGS
      //
      new DailyRotateFile({
        dirname: logsDir,

        filename: "errors-%DATE%.log",

        datePattern: "YYYY-MM-DD",

        zippedArchive: true,

        maxSize: "20m",

        maxFiles: "30d",

        level: "error",

        format: createFileFormat(),
      }),
    ],

    //
    // HANDLE UNCAUGHT ERRORS
    //
    exceptionHandlers: [
      new DailyRotateFile({
        dirname: logsDir,

        filename: "exceptions-%DATE%.log",

        datePattern: "YYYY-MM-DD",

        zippedArchive: true,

        maxSize: "20m",

        maxFiles: "30d",

        format: createFileFormat(),
      }),
    ],

    //
    // HANDLE PROMISE REJECTIONS
    //
    rejectionHandlers: [
      new DailyRotateFile({
        dirname: logsDir,

        filename: "rejections-%DATE%.log",

        datePattern: "YYYY-MM-DD",

        zippedArchive: true,

        maxSize: "20m",

        maxFiles: "30d",

        format: createFileFormat(),
      }),
    ],
  });
};

export const bLogger = createLogger("backend");

export const fLogger = createLogger("frontend");
