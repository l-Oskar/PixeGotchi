import axios from "axios";
import type { FeedbackModalDetails } from "@/types/feedback-modal";

const DEFAULT_TITLE = "Something went wrong";
const DEFAULT_MESSAGE = "Please try again.";
const SERVER_ERROR_MESSAGE = "Server error. Please try again later.";
const NETWORK_ERROR_MESSAGE =
  "Unable to connect to the server. Check your connection and try again.";
const TIMEOUT_ERROR_MESSAGE = "The request timed out. Please try again.";
const RATE_LIMIT_ERROR_MESSAGE =
  "Too many requests. Wait a moment and try again.";
const ERROR_CODE_PATTERN = /^[A-Z][A-Z0-9_]+$/;

export interface ApiErrorOptions {
  title?: string;
  fallbackMessage?: string;
  retry?: () => void;
  retryLabel?: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const getRequestId = (headers: unknown) => {
  if (!isRecord(headers)) return undefined;
  return getString(headers["x-request-id"]);
};

const getResponseDetails = (data: unknown) => {
  if (typeof data === "string") {
    return { message: getString(data) };
  }

  if (!isRecord(data)) {
    return {};
  }

  const error = getString(data.error);
  const responseMessage = getString(data.message);
  const explicitCode = getString(data.code);
  const inferredCode =
    error && ERROR_CODE_PATTERN.test(error) ? error : undefined;
  const code = explicitCode ?? inferredCode;

  return {
    code,
    message:
      code && responseMessage ? responseMessage : error ?? responseMessage,
  };
};

export const isUnauthorizedApiError = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 401;

export const normalizeApiError = (
  error: unknown,
  options: ApiErrorOptions = {},
): FeedbackModalDetails => {
  const title = options.title ?? DEFAULT_TITLE;
  const fallbackMessage = options.fallbackMessage ?? DEFAULT_MESSAGE;
  const action = options.retry
    ? {
        label: options.retryLabel ?? "Retry",
        onClick: options.retry,
      }
    : undefined;

  if (!axios.isAxiosError(error)) {
    return {
      variant: "error",
      title,
      message: fallbackMessage,
      action,
    };
  }

  const status = error.response?.status;
  const requestId = getRequestId(error.response?.headers);
  const responseDetails = getResponseDetails(error.response?.data);
  const baseDetails = {
    variant: "error" as const,
    title,
    status,
    code: responseDetails.code,
    requestId,
    action,
  };

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return {
      ...baseDetails,
      message: TIMEOUT_ERROR_MESSAGE,
    };
  }

  if (!error.response) {
    return {
      ...baseDetails,
      message: NETWORK_ERROR_MESSAGE,
    };
  }

  if (status === 429) {
    return {
      ...baseDetails,
      message: RATE_LIMIT_ERROR_MESSAGE,
    };
  }

  if (status && status >= 500) {
    return {
      ...baseDetails,
      message: SERVER_ERROR_MESSAGE,
    };
  }

  return {
    ...baseDetails,
    message: responseDetails.message ?? fallbackMessage,
  };
};
