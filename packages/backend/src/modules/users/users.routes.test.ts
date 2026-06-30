import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "@/app";
import { createItem, createPixegotchi, createUser } from "@/test/helpers/factories";
import { prisma } from "@/database/prisma";

let app: FastifyInstance | undefined;

function authHeaders(app: FastifyInstance, userId: number) {
  return {
    authorization: `Bearer ${app.jwt.sign({ userId })}`,
  };
}

afterEach(async () => {
  await app?.close();
  app = undefined;
});

describe("users routes", () => {
  it("returns authenticated user profile with related state", async () => {
    app = await buildApp();
    const user = await createUser({
      telegramId: BigInt(555001),
      username: "profile-user",
    });
    await createItem({ itemId: "apple" });
    await prisma.inventory.create({
      data: {
        userId: user.id,
        itemId: "apple",
        itemType: "food",
        rarity: "common",
        quantity: 2,
      },
    });
    await createPixegotchi(user.id, { name: "ActiveOne" });

    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({
      id: user.id,
      telegramId: "555001",
      username: "profile-user",
      inventory: [{ itemId: "apple", quantity: 2 }],
      pixegotchis: [{ name: "ActiveOne", status: "active" }],
    });
  });

  it("returns 404 when JWT user does not exist", async () => {
    app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/users/me",
      headers: authHeaders(app, 999999),
    });

    expect(response.statusCode, response.body).toBe(404);
    expect(response.json()).toEqual({ error: "User not found" });
  });
});
