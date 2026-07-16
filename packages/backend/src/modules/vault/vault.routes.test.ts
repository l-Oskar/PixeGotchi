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

describe("vault routes", () => {
  it("returns only the authenticated user's Vault-table members", async () => {
    app = await buildApp();
    const user = await createUser();
    const otherUser = await createUser();
    const member = await createPixegotchi(user.id, {
      name: "Member",
      status: "vault",
      level: 20,
    });
    await createPixegotchi(user.id, {
      name: "StatusOnly",
      status: "vault",
      level: 30,
    });
    const otherMember = await createPixegotchi(otherUser.id, {
      name: "OtherMember",
      status: "vault",
      level: 40,
    });

    await prisma.vault.createMany({
      data: [
        {
          userId: user.id,
          pixegotchiId: member.id,
          finalLevel: member.level,
        },
        {
          userId: otherUser.id,
          pixegotchiId: otherMember.id,
          finalLevel: otherMember.level,
        },
      ],
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/vault",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toHaveLength(1);
    expect(response.json()[0]).toMatchObject({
      id: member.id,
      name: "Member",
    });
  });

  it("builds stats from Vault-table membership", async () => {
    app = await buildApp();
    const user = await createUser();
    const member = await createPixegotchi(user.id, {
      status: "vault",
      level: 30,
      element: "water",
      rarity: "rare",
    });
    await createPixegotchi(user.id, {
      status: "vault",
      level: 100,
      element: "water",
      rarity: "legendary",
    });

    await prisma.vault.create({
      data: {
        userId: user.id,
        pixegotchiId: member.id,
        finalLevel: member.level,
      },
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/vault/stats",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toHaveLength(14);
    expect(response.json()).toContainEqual({
      element: "water",
      count: 1,
      bestRarity: "rare",
      highestLevel: 30,
      isEmpty: false,
    });
  });

  it("activates a Pixegotchi from Vault transactionally", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, {
      name: "ComeBack",
      status: "vault",
      level: 20,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { currentPixegotchiId: null },
    });
    await prisma.vault.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        finalLevel: pixegotchi.level,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/vault/${pixegotchi.id}/activate`,
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({
      id: pixegotchi.id,
      name: "ComeBack",
      status: "active",
    });

    const [storedUser, storedPixegotchi, vaultEntry] = await Promise.all([
      prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
      prisma.pixegotchi.findUniqueOrThrow({
        where: { id: pixegotchi.id },
      }),
      prisma.vault.findUnique({
        where: {
          userId_pixegotchiId: {
            userId: user.id,
            pixegotchiId: pixegotchi.id,
          },
        },
      }),
    ]);

    expect(storedUser.currentPixegotchiId).toBe(pixegotchi.id);
    expect(storedPixegotchi.status).toBe("active");
    expect(vaultEntry).toBeNull();
  });

  it("returns 409 when the current Pixegotchi slot is occupied", async () => {
    app = await buildApp();
    const user = await createUser();
    const current = await createPixegotchi(user.id, { name: "Current" });
    const vaulted = await createPixegotchi(user.id, {
      name: "Stored",
      status: "vault",
      level: 20,
    });
    await prisma.vault.create({
      data: {
        userId: user.id,
        pixegotchiId: vaulted.id,
        finalLevel: vaulted.level,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/vault/${vaulted.id}/activate`,
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(409);
    expect(response.json()).toEqual({
      error: "You already have a current Pixegotchi",
    });
    expect(
      await prisma.user.findUniqueOrThrow({ where: { id: user.id } }),
    ).toMatchObject({ currentPixegotchiId: current.id });
    expect(await prisma.vault.count({ where: { userId: user.id } })).toBe(1);
  });

  it("does not activate another user's vaulted Pixegotchi", async () => {
    app = await buildApp();
    const user = await createUser();
    const otherUser = await createUser();
    const vaulted = await createPixegotchi(otherUser.id, {
      status: "vault",
      level: 20,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { currentPixegotchiId: null },
    });
    await prisma.user.update({
      where: { id: otherUser.id },
      data: { currentPixegotchiId: null },
    });
    await prisma.vault.create({
      data: {
        userId: otherUser.id,
        pixegotchiId: vaulted.id,
        finalLevel: vaulted.level,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/vault/${vaulted.id}/activate`,
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(404);
    expect(response.json()).toEqual({
      error: "Pixegotchi not found in your Vault",
    });
    expect(
      await prisma.pixegotchi.findUniqueOrThrow({ where: { id: vaulted.id } }),
    ).toMatchObject({ status: "vault" });
  });

  it("returns 409 when Vault membership and status are inconsistent", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, {
      status: "active",
      level: 20,
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { currentPixegotchiId: null },
    });
    await prisma.vault.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        finalLevel: pixegotchi.level,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: `/api/vault/${pixegotchi.id}/activate`,
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(409);
    expect(response.json()).toEqual({
      error: "Pixegotchi with status active cannot be activated from Vault",
    });
    expect(await prisma.vault.count({ where: { userId: user.id } })).toBe(1);
  });
});
