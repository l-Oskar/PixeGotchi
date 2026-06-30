import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "@/database/prisma";
import { buildApp } from "@/app";

let app: FastifyInstance | undefined;

function createInitData(user: Record<string, unknown>) {
  return `user=${encodeURIComponent(JSON.stringify(user))}`;
}

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe("auth routes", () => {
  it("authenticates Telegram init data in test mode and creates a user", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/telegram",
      payload: {
        initData: createInitData({
          id: 777001,
          username: "tester",
        }),
      },
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({
      user: {
        telegramId: "777001",
        username: "tester",
      },
    });
    expect(response.json().token).toEqual(expect.any(String));
    await expect(
      prisma.user.count({ where: { telegramId: BigInt(777001) } }),
    ).resolves.toBe(1);
  });

  it("rejects invalid Telegram auth payloads", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/telegram",
      payload: {
        initData: "",
      },
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toEqual({ error: "Invalid Telegram init data" });
  });

  it("refreshes a valid JWT and rejects missing tokens", async () => {
    app = await buildApp();
    const token = app.jwt.sign({ userId: 42 });

    const validResponse = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    expect(validResponse.statusCode, validResponse.body).toBe(200);
    expect(validResponse.json().token).toEqual(expect.any(String));

    const invalidResponse = await app.inject({
      method: "POST",
      url: "/api/auth/refresh",
    });

    expect(invalidResponse.statusCode, invalidResponse.body).toBe(401);
    expect(invalidResponse.json()).toEqual({ error: "Invalid token" });
  });
});
