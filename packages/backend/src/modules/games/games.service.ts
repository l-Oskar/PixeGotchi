import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  CompleteGameSessionPayload,
  buildPixegotchiSnapshot,
  ChestGenerator,
  GAME_CONFIGS,
  getFinalEnergyCost,
  getFinalExp,
  getFinalPgc,
  getTraitModifier,
  RARITY_STATS,
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

    return prisma.$transaction(async (tx) => {
      const currentPixegotchi = await tx.pixegotchi.findUniqueOrThrow({
        where: { id: input.pixegotchiId },
      });
      const now = new Date();
      const snapshot = buildPixegotchiSnapshot(currentPixegotchi, now);

      if (snapshot.status !== "active") {
        throw httpError(400, "Pixegotchi is not active");
      }

      const energyCost = getFinalEnergyCost(
        snapshot.health,
        snapshot.rarity,
        config.energyCost,
        snapshot.traits,
      );

      if (snapshot.energy < energyCost) {
        throw httpError(400, "Insufficient energy");
      }

      const energyUpdate = await tx.pixegotchi.updateMany({
        where: {
          id: input.pixegotchiId,
          userId,
          status: "active",
          lastUpdateAt: currentPixegotchi.lastUpdateAt,
        },
        data: {
          health: Math.round(snapshot.health),
          hunger: Math.round(snapshot.hunger),
          energy: Math.round(snapshot.energy - energyCost),
          happiness: Math.round(snapshot.happiness),
          cleanliness: Math.round(snapshot.cleanliness),
          lastPlayedAt: now,
          lastUpdateAt: now,
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
        pixegotchi: true,
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

    const completionTime = new Date(Date.now());
    const actualDurationSec = Math.max(
      1,
      Math.floor(
        (completionTime.getTime() - session.createdAt.getTime()) / 1000,
      ),
    );
    if (input.score > 0 && actualDurationSec < config.minDuration) {
      throw httpError(400, "Game session finished too quickly");
    }
    const maxPossibleScore = actualDurationSec * config.maxScorePerSecond;
    const safeScore = Math.min(
      input.score,
      maxPossibleScore,
      config.maxScore ?? Number.POSITIVE_INFINITY,
    );
    const pixegotchiSnapshot = buildPixegotchiSnapshot(
      session.pixegotchi,
      completionTime,
    );
    const chestModifier = getTraitModifier(
      session.pixegotchi.traits,
      "game_chest_chance",
    );
    const pgcEarned = new Prisma.Decimal(
      getFinalPgc(
        safeScore,
        config.maxScore ?? maxPossibleScore,
        pixegotchiSnapshot.rarity,
        pixegotchiSnapshot.traits,
        config.difficultyMultiplier,
      ),
    );
    const experienceGained = getFinalExp(
      pixegotchiSnapshot.happiness,
      pixegotchiSnapshot.level,
      safeScore,
      config.maxScore ?? maxPossibleScore,
      RARITY_STATS[pixegotchiSnapshot.rarity].maxStat,
      config.difficultyMultiplier,
    );
    const chestChance =
      safeScore > 0
        ? Math.min(1, config.chestDropChance * chestModifier)
        : 0;
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
          completedAt: completionTime,
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
