import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  CompleteGameSessionPayload,
  ChestGenerator,
  GAME_CONFIGS,
  getFinalEnergyCost,
  getTraitModifier,
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

    const energyCost = getFinalEnergyCost(
      pixegotchi.health,
      pixegotchi.rarity,
      config.energyCost,
      pixegotchi.traits,
    );

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
      include: {
        pixegotchi: {
          select: { traits: true },
        },
      },
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
    const pgcModifier = getTraitModifier(
      session.pixegotchi.traits,
      "game_pgc_gain",
    );
    const expModifier = getTraitModifier(
      session.pixegotchi.traits,
      "game_exp_gain",
    );
    const chestModifier = getTraitModifier(
      session.pixegotchi.traits,
      "game_chest_chance",
    );
    const pgcEarned = new Prisma.Decimal(safeScore)
      .mul(config.pgcPerPoint)
      .mul(pgcModifier);
    const experienceGained = Math.floor(
      safeScore * config.expPerPoint * expModifier,
    );
    const chestChance = Math.min(1, config.chestDropChance * chestModifier);
    const chestDropped = Math.random() < chestChance;
    const droppedChest = chestDropped
      ? ChestGenerator.generateRandomChest()
      : null;

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
          itemsDropped: droppedChest
            ? { chestType: droppedChest.chestType }
            : undefined,
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

      if (droppedChest) {
        await tx.chest.create({
          data: {
            userId,
            chestType: droppedChest.chestType,
          },
        });
      }

      const experienceUpdate = await this.pixegotchiService.addExpToPixegotchi(
        userId,
        session.pixegotchiId,
        experienceGained,
        tx,
        false,
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
