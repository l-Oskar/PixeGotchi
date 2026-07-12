import { afterEach, describe, expect, it, vi } from "vitest";
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
  vi.restoreAllMocks();
  await app?.close();
  app = undefined;
});

describe("games routes", () => {
  it("starts a game session and spends energy atomically", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { energy: 15 });

    const response = await app.inject({
      method: "POST",
      url: "/api/games/start",
      headers: authHeaders(app, user.id),
      payload: {
        pixegotchiId: pixegotchi.id,
        gameId: "catch_fruits",
      },
    });

    expect(response.statusCode, response.body).toBe(201);
    expect(response.json()).toMatchObject({
      userId: user.id,
      pixegotchiId: pixegotchi.id,
      gameId: "catch_fruits",
      energySpent: 10,
      completed: false,
    });

    const updatedPixegotchi = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });
    expect(updatedPixegotchi.energy).toBe(5);
  });

  it("does not let parallel starts overspend energy", async () => {
    app = await buildApp();
    const user = await createUser();
    const pixegotchi = await createPixegotchi(user.id, { energy: 10 });

    const responses = await Promise.all(
      [1, 2].map(() =>
        app!.inject({
          method: "POST",
          url: "/api/games/start",
          headers: authHeaders(app!, user.id),
          payload: {
            pixegotchiId: pixegotchi.id,
            gameId: "catch_fruits",
          },
        }),
      ),
    );

    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      201,
      400,
    ]);

    const updatedPixegotchi = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });
    const sessions = await prisma.gameSession.findMany({
      where: { userId: user.id },
    });

    expect(updatedPixegotchi.energy).toBe(0);
    expect(sessions).toHaveLength(1);
  });

  it("completes a session using server duration and clamped score", async () => {
    app = await buildApp();
    const user = await createUser({ pgcBalance: 100 });
    const pixegotchi = await createPixegotchi(user.id, {
      energy: 50,
      experience: 0,
    });
    const startResponse = await app.inject({
      method: "POST",
      url: "/api/games/start",
      headers: authHeaders(app, user.id),
      payload: {
        pixegotchiId: pixegotchi.id,
        gameId: "catch_fruits",
      },
    });
    const startedSession = startResponse.json();
    const now = new Date("2026-01-01T00:01:00.000Z").getTime();

    await prisma.gameSession.update({
      where: { id: startedSession.id },
      data: { createdAt: new Date(now - 60_000) },
    });
    vi.spyOn(Date, "now").mockReturnValue(now);

    const completeResponse = await app.inject({
      method: "POST",
      url: `/api/games/${startedSession.id}/complete`,
      headers: authHeaders(app, user.id),
      payload: {
        score: 999,
        duration: 999,
        pgcEarned: 999,
      },
    });

    expect(completeResponse.statusCode, completeResponse.body).toBe(200);
    expect(completeResponse.json()).toMatchObject({
      id: startedSession.id,
      score: 150,
      duration: 60,
      pgcEarned: "75",
      experienceGained: 56,
      completed: true,
    });

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const updatedPixegotchi = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });

    expect(updatedUser.pgcBalance.toString()).toBe("175");
    expect(updatedPixegotchi.experience).toBe(56);
  });

  it("applies score, rarity, traits, happiness, and level to rewards", async () => {
    app = await buildApp();
    const user = await createUser({ pgcBalance: 100 });
    const pixegotchi = await createPixegotchi(user.id, {
      energy: 50,
      experience: 0,
      rarity: "legendary",
      happiness: 104,
      level: 10,
      traits: ["optimist", "curious"],
    });
    const startResponse = await app.inject({
      method: "POST",
      url: "/api/games/start",
      headers: authHeaders(app, user.id),
      payload: {
        pixegotchiId: pixegotchi.id,
        gameId: "catch_fruits",
      },
    });
    const session = startResponse.json();
    const replacementPixegotchi = await createPixegotchi(user.id, {
      experience: 0,
    });
    await prisma.pixegotchi.update({
      where: { id: pixegotchi.id },
      data: { status: "vault" },
    });
    const now = new Date("2026-01-01T00:01:00.000Z").getTime();

    await prisma.gameSession.update({
      where: { id: session.id },
      data: { createdAt: new Date(now - 60_000) },
    });
    vi.spyOn(Date, "now").mockReturnValue(now);
    vi.spyOn(Math, "random").mockReturnValue(0.8);

    const response = await app.inject({
      method: "POST",
      url: `/api/games/${session.id}/complete`,
      headers: authHeaders(app, user.id),
      payload: { score: 80 },
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toMatchObject({
      pgcEarned: "69",
      experienceGained: 59,
      chestDropped: true,
      itemsDropped: { chestType: "golden" },
    });

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const updatedPixegotchi = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });
    const unchangedReplacement = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: replacementPixegotchi.id },
    });
    const droppedChests = await prisma.chest.findMany({
      where: { userId: user.id, isOpened: false },
    });

    expect(updatedUser.pgcBalance.toString()).toBe("169");
    expect(updatedPixegotchi.experience).toBe(59);
    expect(unchangedReplacement.experience).toBe(0);
    expect(droppedChests).toHaveLength(1);
    expect(droppedChests[0]?.chestType).toBe("golden");
  });

  it("does not award rewards twice for one session", async () => {
    app = await buildApp();
    const user = await createUser({ pgcBalance: 100 });
    const pixegotchi = await createPixegotchi(user.id, { experience: 0 });
    const session = await prisma.gameSession.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        gameId: "catch_fruits",
        energySpent: 10,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });
    vi.spyOn(Date, "now").mockReturnValue(
      new Date("2026-01-01T00:01:00.000Z").getTime(),
    );

    const responses = await Promise.all(
      [1, 2].map(() =>
        app!.inject({
          method: "POST",
          url: `/api/games/${session.id}/complete`,
          headers: authHeaders(app!, user.id),
          payload: { score: 80 },
        }),
      ),
    );

    expect(responses.map((response) => response.statusCode).sort()).toEqual([
      200,
      400,
    ]);

    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const updatedPixegotchi = await prisma.pixegotchi.findUniqueOrThrow({
      where: { id: pixegotchi.id },
    });

    expect(updatedUser.pgcBalance.toString()).toBe("140");
    expect(updatedPixegotchi.experience).toBe(45);
  });

  it("rejects an early scored completion but allows abandoning with zero rewards", async () => {
    app = await buildApp();
    const user = await createUser({ pgcBalance: 100 });
    const pixegotchi = await createPixegotchi(user.id, { experience: 0 });
    const now = new Date("2026-01-01T00:00:10.000Z").getTime();
    const session = await prisma.gameSession.create({
      data: {
        userId: user.id,
        pixegotchiId: pixegotchi.id,
        gameId: "catch_fruits",
        energySpent: 10,
        createdAt: new Date(now - 10_000),
      },
    });
    vi.spyOn(Date, "now").mockReturnValue(now);

    const earlyResponse = await app.inject({
      method: "POST",
      url: `/api/games/${session.id}/complete`,
      headers: authHeaders(app, user.id),
      payload: { score: 80 },
    });
    expect(earlyResponse.statusCode, earlyResponse.body).toBe(400);

    const abandonResponse = await app.inject({
      method: "POST",
      url: `/api/games/${session.id}/complete`,
      headers: authHeaders(app, user.id),
      payload: { score: 0 },
    });
    expect(abandonResponse.statusCode, abandonResponse.body).toBe(200);
    expect(abandonResponse.json()).toMatchObject({
      pgcEarned: "0",
      experienceGained: 0,
      completed: true,
    });
  });

  it("returns only the authenticated user's latest game history", async () => {
    app = await buildApp();
    const user = await createUser();
    const otherUser = await createUser();
    const pixegotchi = await createPixegotchi(user.id);
    const otherPixegotchi = await createPixegotchi(otherUser.id);

    await prisma.gameSession.createMany({
      data: [
        {
          userId: user.id,
          pixegotchiId: pixegotchi.id,
          gameId: "catch_fruits",
        },
        {
          userId: otherUser.id,
          pixegotchiId: otherPixegotchi.id,
          gameId: "catch_fruits",
        },
      ],
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/games/history?gameId=catch_fruits",
      headers: authHeaders(app, user.id),
    });

    expect(response.statusCode, response.body).toBe(200);
    expect(response.json()).toHaveLength(1);
    expect(response.json()[0]).toMatchObject({
      userId: user.id,
      pixegotchiId: pixegotchi.id,
      gameId: "catch_fruits",
    });
  });
});
