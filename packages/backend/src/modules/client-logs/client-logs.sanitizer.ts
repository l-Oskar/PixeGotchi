import type { ClientLogPayload } from "./client-logs.schema";

const sensitiveValuePattern =
  /(authorization|cookie|password|access[_-]?token|refresh[_-]?token|token|jwt|initdata|telegraminitdata)\s*[:=]\s*([^\s,;&}"']+)/gi;
const urlQueryPattern = /(https?:\/\/[^\s?#)]+)\?[^\s)]+/gi;

function sanitizeText(value: string): string {
  return value
    .replace(urlQueryPattern, "$1?[REDACTED]")
    .replace(sensitiveValuePattern, "$1=[REDACTED]");
}

function sanitizePath(value: string): string {
  return value.split("?", 1)[0]?.slice(0, 500) || "/";
}

export function sanitizeClientLog(
  payload: ClientLogPayload,
): ClientLogPayload {
  return {
    ...payload,
    message: sanitizeText(payload.message),
    stack: payload.stack ? sanitizeText(payload.stack) : undefined,
    path: sanitizePath(payload.path),
    metadata: payload.metadata
      ? {
          ...payload.metadata,
          apiPath: payload.metadata.apiPath
            ? sanitizePath(payload.metadata.apiPath)
            : undefined,
        }
      : undefined,
  };
}

