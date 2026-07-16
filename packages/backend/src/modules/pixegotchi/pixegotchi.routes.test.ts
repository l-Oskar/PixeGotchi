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

  it("sends the current pixegotchi to Vault transactionally", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, {
      name: "VaultMe",
      level: 10,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/pixegotchi/current/vault",
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

    const [storedUser, vaultEntry] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
      prisma.vault.findUniqueOrThrow({
        where: {
          userId_pixegotchiId: {
            userId: user.id,
            pixegotchiId: pixegotchi.id,
          },
        },
      }),
    ]);

    expect(storedUser.currentPixegotchiId).toBeNull();
    expect(vaultEntry.finalLevel).toBe(10);
  });

  it("keeps the inactive route as a compatibility alias", async () => {
    app = await buildApp();
    const user = await createUser();
    await createPixegotchi(user.id, { level: 20 });

    const response = await app.inject({
      method: "POST",
      url: "/api/pixegotchi/inactive",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({ status: "vault", level: 20 });
    expect(await prisma.vault.count({ where: { userId: user.id } })).toBe(1);
  });

  it("refreshes an existing Vault row instead of creating a duplicate", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { level: 30 });
    const oldStoredAt = new Date("2025-01-01T00:00:00.000Z");
    await prisma.vault.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        finalLevel: 10,
        storedAt: oldStoredAt,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/pixegotchi/current/vault",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    const entries = await prisma.vault.findMany({
      where: { userId: user.id },
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ finalLevel: 30 });
    expect(entries[0]!.storedAt.getTime()).toBeGreaterThan(
      oldStoredAt.getTime(),
    );
  });

  it("returns 409 without changing state at an invalid Vault level", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { level: 9 });

    const response = await app.inject({
      method: "POST",
      url: "/api/pixegotchi/current/vault",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(409);
    expect(response.json()).toMatchObject({
      error: "Pixegotchi can only be stored at levels 10, 20, 30, and so on",
    });

    const [storedUser, storedPixegotchi, vaultCount] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
      prisma.pixegotchi.findUniqueOrThrow({ where: { id: pixegotchi.id } }),
      prisma.vault.count({ where: { userId: user.id } }),
    ]);

    expect(storedUser.currentPixegotchiId).toBe(pixegotchi.id);
    expect(storedPixegotchi.status).toBe("active");
    expect(vaultCount).toBe(0);
  });

  it.each(["critical", "dead"] as const)(
    "returns 409 for a %s current pixegotchi",
    async (status) => {
      app = await buildApp();
      const user = await createUser();
      const pixegotchi = await createPixegotchi(user.id, {
        level: 10,
        status,
        ...(status === "critical"
          ? { health: 0, criticalSince: new Date() }
          : {}),
      });

      const response = await app.inject({
        method: "POST",
        url: "/api/pixegotchi/current/vault",
        headers: authHeaders(app, user.id),
      });

      expect(response.statusCode, response.body).toBe(409);
      expect(response.json()).toMatchObject({
        error: `Pixegotchi with status ${status} cannot be stored in Vault`,
      });
      expect(
        await prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
      ).toMatchObject({ currentPixegotchiId: pixegotchi.id });
      expect(await prisma.vault.count({ where: { userId: user.id } })).toBe(0);
    },
  );

  it("returns 404 when the user has no current pixegotchi", async () => {
    app = await buildApp();
    const user = await createUser();

    const response = await app.inject({
      method: "POST",
      url: "/api/pixegotchi/current/vault",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(404);
    expect(response.json()).toEqual({ error: "No current Pixegotchi" });
  });

  it("does not duplicate a Vault entry on a repeated request", async () => {
    app = await buildApp();
    const user = await createUser();
    await createPixegotchi(user.id, { level: 10 });
    const request = {
      method: "POST" as const,
      url: "/api/pixegotchi/current/vault",
      headers: authHeaders(app, user.id),
    };

    const firstResponse = await app.inject(request);
    const repeatedResponse = await app.inject(request);

    expect(firstResponse.statusCode, firstResponse.body).toBe(200);
    expect(repeatedResponse.statusCode, repeatedResponse.body).toBe(409);
    expect(repeatedResponse.json()).toEqual({
      error: "No current Pixegotchi; the request may already be completed",
    });
    expect(await prisma.vault.count({ where: { userId: user.id } })).toBe(1);
  });

  it("keeps Vault membership consistent during concurrent requests", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { level: 10 });
    const request = {
      method: "POST" as const,
      url: "/api/pixegotchi/current/vault",
      headers: authHeaders(app, user.id),
    };

    const responses = await Promise.all([
      app.inject(request),
      app.inject(request),
    ]);

    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      200, 409,
    ]);

    const [storedUser, storedPixegotchi, vaultCount] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
      prisma.pixegotchi.findUniqueOrThrow({ where: { id: pixegotchi.id } }),
      prisma.vault.count({ where: { userId: user.id } }),
    ]);

    expect(storedUser.currentPixegotchiId).toBeNull();
    expect(storedPixegotchi.status).toBe("vault");
    expect(vaultCount).toBe(1);
  });
});
