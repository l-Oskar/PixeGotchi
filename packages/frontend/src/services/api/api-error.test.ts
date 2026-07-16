import { describe, expect, it, vi } from "vitest";
import {
  isUnauthorizedApiError,
  normalizeApiError,
} from "./api-error";

interface AxiosErrorFixtureOptions {
  status?: number;
  data?: unknown;
  code?: string;
  requestId?: string;
}

const createAxiosError = ({
  status,
  data,
  code,
  requestId,
}: AxiosErrorFixtureOptions) => ({
  isAxiosError: true,
  code,
  response:
    status === undefined
      ? undefined
      : {
          status,
          data,
          headers: requestId ? { "x-request-id": requestId } : {},
        },
});

describe("normalizeApiError", () => {
  it("uses a backend domain message for a 409 response", () => {
    const details = normalizeApiError(
      createAxiosError({
        status: 409,
        data: {
          error:
            "Pixegotchi can only be stored at levels 10, 20, 30, and so on",
        },
        requestId: "request-123",
      }),
      { title: "Cannot send to Vault" },
    );

    expect(details).toMatchObject({
      title: "Cannot send to Vault",
      message:
        "Pixegotchi can only be stored at levels 10, 20, 30, and so on",
      status: 409,
      requestId: "request-123",
    });
  });

  it("uses message when the backend returns a stable error code", () => {
    const details = normalizeApiError(
      createAxiosError({
        status: 409,
        data: {
          error: "VAULT_LEVEL_REQUIRED",
          message: "Reach the next Vault level before storing this pet.",
        },
      }),
    );

    expect(details).toMatchObject({
      code: "VAULT_LEVEL_REQUIRED",
      message: "Reach the next Vault level before storing this pet.",
    });
  });

  it("returns a timeout message without exposing the Axios message", () => {
    const details = normalizeApiError(
      createAxiosError({ code: "ECONNABORTED" }),
    );

    expect(details.message).toBe("The request timed out. Please try again.");
  });

  it("returns a network message when no response was received", () => {
    const details = normalizeApiError(createAxiosError({}));

    expect(details.message).toBe(
      "Unable to connect to the server. Check your connection and try again.",
    );
  });

  it("hides backend details for server errors", () => {
    const details = normalizeApiError(
      createAxiosError({
        status: 500,
        data: { error: "Internal failure", message: "sensitive details" },
      }),
    );

    expect(details.message).toBe("Server error. Please try again later.");
    expect(details.message).not.toContain("sensitive details");
  });

  it("adds a retry action when one is provided", () => {
    const retry = vi.fn();
    const details = normalizeApiError(
      createAxiosError({ status: 503 }),
      { retry, retryLabel: "Try again" },
    );

    expect(details.action?.label).toBe("Try again");
    details.action?.onClick();
    expect(retry).toHaveBeenCalledOnce();
  });
});

describe("isUnauthorizedApiError", () => {
  it("identifies only 401 Axios responses", () => {
    expect(isUnauthorizedApiError(createAxiosError({ status: 401 }))).toBe(
      true,
    );
    expect(isUnauthorizedApiError(createAxiosError({ status: 403 }))).toBe(
      false,
    );
    expect(isUnauthorizedApiError(new Error("Unauthorized"))).toBe(false);
  });
});
