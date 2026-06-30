import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
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

describe("inventory routes validation", () => {
  it("returns 400 for invalid add item payload", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/add",
      headers: authHeaders(app),
      payload: {
        itemId: "not_a_real_item",
        quantity: 1,
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });

  it("returns 400 for invalid use item quantity", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/use",
      headers: authHeaders(app),
      payload: {
        itemId: "apple",
        quantity: -1,
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });

  it("returns 400 for invalid open chest payload", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/inventory/open",
      headers: authHeaders(app),
      payload: {
        chestType: "paper",
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });
});
