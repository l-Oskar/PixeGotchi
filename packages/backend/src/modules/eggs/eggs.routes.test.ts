import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { EGG_CONSTANTS } from "@pixegotchi/shared";
import { buildApp } from "@/app";

let app: FastifyInstance | undefined;

function authHeaders(app: FastifyInstance) {
  return {
    authorization: `Bearer ${app.jwt.sign({ userId: 1 })}`,
  };
}

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe("egg routes validation", () => {
  it("returns 400 for invalid egg id params", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/eggs/not-a-number",
      headers: authHeaders(app),
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });

  it("returns 400 for invalid start hatching payload", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/eggs/hatch/start",
      headers: authHeaders(app),
      payload: {
        eggId: 0,
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });

  it("returns 400 for invalid batch tap payload", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/eggs/tap/batch",
      headers: authHeaders(app),
      payload: {
        eggId: 1,
        tapCount: EGG_CONSTANTS.EGG_MAX_BATCH_TAP + 1,
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });

  it("returns 400 for invalid hatch name payload", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/eggs/1/open",
      headers: authHeaders(app),
      payload: {
        name: "no",
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });
});
