import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  CompleteGameSessionPayload,
  GAME_CONFIGS,
  getEnergyCost,
  StartGameSessionInput,
} from "@pixegotchi/shared";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";

function httpError(
  statusCode: number,
  message: string,
): Error & {
  statusCode: number;
} {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

export class GamesService {
  private pixegotchiService = new PixegotchiService();

  async startSession(userId: number, input: StartGameSessionInput) {
    const config = GAME_CONFIGS[input.gameId];

    if (!config) {
      throw httpError(400, "Unknown game");
    }

    const pixegotchi = await prisma.pixegotchi.findUnique({
      where: { id: input.pixegotchiId },
    });

    if (!pixegotchi) {
      throw httpError(404, "Pixegotchi not found");
    }

    if (pixegotchi.userId !== userId) {
      throw httpError(403, "Forbidden");
    }

    if (pixegotchi.status !== "active") {
      throw httpError(400, "Pixegotchi is not active");
    }

    const energyCost =
      config.energyCost * getEnergyCost(pixegotchi.health, pixegotchi.rarity);

    return prisma.$transaction(async (tx) => {
      const energyUpdate = await tx.pixegotchi.updateMany({
        where: {
          id: input.pixegotchiId,
          userId,
          status: "active",
          energy: { gte: energyCost },
        },
        data: {
          energy: { decrement: energyCost },
          lastPlayedAt: new Date(),
          lastUpdateAt: new Date(),
        },
      });

      if (energyUpdate.count === 0) {
        throw httpError(400, "Insufficient energy");
      }

      return tx.gameSession.create({
        data: {
          userId,
          pixegotchiId: input.pixegotchiId,
          gameId: input.gameId,
          energySpent: energyCost,
        },
      });
    });
  }

  async completeSession(
    userId: number,
    sessionId: number,
    input: CompleteGameSessionPayload,
  ) {
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw httpError(404, "Game session not found");
    }

    if (session.userId !== userId) {
      throw httpError(403, "Forbidden");
    }

    if (session.completed) {
      throw httpError(400, "Session already completed");
    }

    const config = GAME_CONFIGS[session.gameId];

    if (!config) {
      throw httpError(400, "Unknown game");
    }

    const actualDurationSec = Math.max(
      1,
      Math.floor((Date.now() - session.createdAt.getTime()) / 1000),
    );
    const maxPossibleScore = actualDurationSec * config.maxScorePerSecond;
    const safeScore = Math.min(input.score, maxPossibleScore);
    const pgcEarned = new Prisma.Decimal(safeScore).mul(config.pgcPerPoint);
    const experienceGained = Math.floor(safeScore * config.expPerPoint);
    const chestDropped = Math.random() < config.chestDropChance;

    return prisma.$transaction(async (tx) => {
      const completionUpdate = await tx.gameSession.updateMany({
        where: {
          id: sessionId,
          userId,
          completed: false,
        },
        data: {
          score: safeScore,
          duration: actualDurationSec,
          pgcEarned,
          experienceGained,
          chestDropped,
          completed: true,
          completedAt: new Date(),
        },
      });

      if (completionUpdate.count === 0) {
        throw httpError(400, "Session already completed");
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          pgcBalance: { increment: pgcEarned },
        },
      });

      const experienceUpdate = await this.pixegotchiService.addExp(
        userId,
        experienceGained,
        tx,
      );

      if (!experienceUpdate) {
        throw httpError(400, "Pixegotchi not found or not active");
      }

      return tx.gameSession.findUniqueOrThrow({
        where: { id: sessionId },
      });
    });
  }

  async getUserSessions(userId: number, gameId?: string) {
    return prisma.gameSession.findMany({
      where: {
        userId,
        ...(gameId ? { gameId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
