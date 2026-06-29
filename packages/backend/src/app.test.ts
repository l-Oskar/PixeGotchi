import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app";

let app: FastifyInstance | undefined;

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe("app routes", () => {
  it("exposes public health endpoint", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: "ok" });
  });

  it("returns 401 for protected routes without JWT", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/inventory",
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 for validation errors instead of 500", async () => {
    app = await buildApp();
    const token = app.jwt.sign({ userId: 1 });

    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/use",
      headers: {
        authorization: `Bearer ${token}`,
      },
      payload: {
        itemId: "apple",
        quantity: 0,
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });
});
