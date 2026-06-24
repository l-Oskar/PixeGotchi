import { API_URL } from "@/services/api/config";
import { useAuthStore } from "@/store/auth.store";

type ClientLogType = "runtime" | "unhandled_rejection" | "api";

interface ClientLogMetadata {
  component?: string;
  apiMethod?: string;
  apiPath?: string;
  statusCode?: number;
  release?: string;
  telegramPlatform?: string;
}

interface ClientLogPayload {
  level: "error" | "warn";
  type: ClientLogType;
  message: string;
  stack?: string;
  path: string;
  requestId?: string;
  occurredAt: string;
  metadata?: ClientLogMetadata;
}

const MAX_EVENTS_PER_MINUTE = 5;
const DEDUPLICATION_WINDOW_MS = 60_000;
const recentEvents: number[] = [];
const recentFingerprints = new Map<string, number>();
let isInstalled = false;

function withoutQuery(value: string): string {
  return value.split("?", 1)[0] || "/";
}

function normalizeError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message.slice(0, 2_000),
      stack: error.stack?.slice(0, 8_000),
    };
  }

  return {
    message: String(error).slice(0, 2_000),
  };
}

function canSend(payload: ClientLogPayload): boolean {
  const now = Date.now();

  while (recentEvents[0] && now - recentEvents[0] >= 60_000) {
    recentEvents.shift();
  }

  if (recentEvents.length >= MAX_EVENTS_PER_MINUTE) {
    return false;
  }

  const fingerprint = `${payload.type}:${payload.message}:${payload.stack ?? ""}`;
  const lastSentAt = recentFingerprints.get(fingerprint);

  if (lastSentAt && now - lastSentAt < DEDUPLICATION_WINDOW_MS) {
    return false;
  }

  recentEvents.push(now);
  recentFingerprints.set(fingerprint, now);

  for (const [key, sentAt] of recentFingerprints) {
    if (now - sentAt >= DEDUPLICATION_WINDOW_MS) {
      recentFingerprints.delete(key);
    }
  }

  return true;
}

async function sendClientLog(payload: ClientLogPayload): Promise<void> {
  if (!import.meta.env.PROD || !canSend(payload)) {
    return;
  }

  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    await fetch(`${API_URL}/logs/client`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Logging must never cause another application error.
  }
}

export function reportClientError(
  type: ClientLogType,
  error: unknown,
  options: {
    requestId?: string;
    metadata?: ClientLogMetadata;
  } = {},
): void {
  const normalizedError = normalizeError(error);

  void sendClientLog({
    level: "error",
    type,
    message: normalizedError.message,
    stack: normalizedError.stack,
    path: withoutQuery(window.location.pathname),
    requestId: options.requestId,
    occurredAt: new Date().toISOString(),
    metadata: {
      release: import.meta.env.VITE_APP_VERSION ?? "unknown",
      ...options.metadata,
    },
  });
}

export function installClientErrorLogging(): void {
  if (isInstalled) {
    return;
  }

  isInstalled = true;

  window.addEventListener("error", (event) => {
    reportClientError("runtime", event.error ?? event.message);
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportClientError("unhandled_rejection", event.reason);
  });
}
