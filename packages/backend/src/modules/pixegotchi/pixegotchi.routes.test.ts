import { afterEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "@/app";
import { prisma } from "@/database/prisma";
import { createPixegotchi, createUser } from "@/test/helpers/factories";

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

describe("pixegotchi routes", () => {
  it("returns all and current pixegotchis for the authenticated user", async () => {
    app = await buildApp();
    const user = await createUser();
    const otherUser = await createUser();
    await createPixegotchi(user.id, { name: "Mine" });
    await createPixegotchi(otherUser.id, { name: "Other" });

    const allResponse = await app.inject({
      method: "GET",
      url: "/api/pixegotchi",
      headers: authHeaders(app, user.id),
    });

    expect(allResponse.statusCode, allResponse.body).toBe(200);
    expect(allResponse.json()).toHaveLength(1);
    expect(allResponse.json()[0]).toMatchObject({ name: "Mine" });

    const currentResponse = await app.inject({
      method: "GET",
      url: "/api/pixegotchi/current",
      headers: authHeaders(app, user.id),
    });

    expect(currentResponse.statusCode, currentResponse.body).toBe(200);
    expect(currentResponse.json()).toMatchObject({ name: "Mine" });
  });

  it("returns current dead pixegotchi but ignores historical dead without current pointer", async () => {
    app = await buildApp();
    const currentDeadUser = await createUser();
    await createPixegotchi(currentDeadUser.id, {
      name: "CurrentDead",
      status: "dead",
    });

    const currentDeadResponse = await app.inject({
      method: "GET",
      url: "/api/pixegotchi/current",
      headers: authHeaders(app, currentDeadUser.id),
    });

    expect(currentDeadResponse.statusCode, currentDeadResponse.body).toBe(200);
    expect(currentDeadResponse.json()).toMatchObject({
      name: "CurrentDead",
      status: "dead",
    });

    const historicalDeadUser = await createUser();
    await createPixegotchi(historicalDeadUser.id, {
      name: "OldDead",
      status: "dead",
    });
    await createPixegotchi(historicalDeadUser.id, {
      name: "Stored",
      status: "vault",
    });
    await prisma.user.update({
      where: { id: historicalDeadUser.id },
      data: { currentPixegotchiId: null },
    });

    const historicalDeadResponse = await app.inject({
      method: "GET",
      url: "/api/pixegotchi/current",
      headers: authHeaders(app, historicalDeadUser.id),
    });

    expect(historicalDeadResponse.statusCode, historicalDeadResponse.body).toBe(
      200,
    );
    expect(historicalDeadResponse.body).toBe("null");
  });

  it("returns a pixegotchi by id only for its owner", async () => {
    app = await buildApp();
    const user = await createUser();
    const otherUser = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { name: "Owned" });

    const ownerResponse = await app.inject({
      method: "GET",
      url: `/api/pixegotchi/${pixegotchi.id}`,
      headers: authHeaders(app, user.id),
    });

    expect(ownerResponse.statusCode, ownerResponse.body).toBe(200);
    expect(ownerResponse.json()).toMatchObject({ name: "Owned" });

    const otherUserResponse = await app.inject({
      method: "GET",
      url: `/api/pixegotchi/${pixegotchi.id}`,
      headers: authHeaders(app, otherUser.id),
    });

    expect(otherUserResponse.statusCode, otherUserResponse.body).toBe(404);
    expect(otherUserResponse.json()).toEqual({ error: "Pixegotchi not found" });
  });

  it("returns 400 for invalid pixegotchi id params", async () => {
    app = await buildApp();
    const user = await createUser();

    const response = await app.inject({
      method: "GET",
      url: "/api/pixegotchi/not-a-number",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(400);
    expect(response.json()).toMatchObject({ error: "Validation error" });
  });

  it("sets active pixegotchi inactive", async () => {
    app = await buildApp();
    const user = await createUser();
    await createPixegotchi(user.id, { name: "VaultMe" });

    const response = await app.inject({
      method: "POST",
      url: "/api/pixegotchi/inactive",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({
      name: "VaultMe",
      status: "vault",
    });

    const activeResponse = await app.inject({
      method: "GET",
      url: "/api/pixegotchi/active",
      headers: authHeaders(app, user.id),
    });

    expect(activeResponse.statusCode, activeResponse.body).toBe(200);
    expect(activeResponse.body).toBe("null");
  });
});
