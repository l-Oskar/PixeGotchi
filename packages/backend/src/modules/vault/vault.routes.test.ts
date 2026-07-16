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
});
