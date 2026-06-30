import { prisma } from "@/database/prisma";
import { config } from "@/config/env";
import { GenomeGenerator } from "@/utils/genome-generator";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";
import { CREATE_STATS, EGG_CONSTANTS, assertValidGenomeHash } from "@pixegotchi/shared";
import Redis from "ioredis";

export class EggService {
  private pixegotchiService = new PixegotchiService();
  private redis?: Redis;

  private getRedis() {
    this.redis ??= new Redis(config.redisUrl);
    return this.redis;
  }

  async close() {
    await this.redis?.quit();
    this.redis = undefined;
  }

  async findAllEggs(userId: number) {
    const eggs = await prisma.egg.findMany({
      where: {
        userId,
        isHatched: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return eggs ?? [];
  }

  async getEggById(userId: number, id: number) {
    const egg = await prisma.egg.findFirst({
      where: {
        userId,
        id,
      },
    });

    if (!egg) throw new Error(`No egg with this ID:${id}`);
    return egg;
  }

  async getHatchingEgg(userId: number) {
    const hatchingEgg = await prisma.egg.findFirst({
      where: {
        userId,
        isHatching: true,
        isHatched: false,
      },
    });

    // if (!hatchingEgg) throw new Error("You don\'t have hatching egg");
    return hatchingEgg ?? null;
  }

  async createEgg(userId: number) {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new Error("User not found");

      const balanceUpdate = await tx.user.updateMany({
        where: {
          id: userId,
          pgcBalance: {
            gte: EGG_CONSTANTS.EGG_PRICE,
          },
        },
        data: {
          pgcBalance: {
            decrement: EGG_CONSTANTS.EGG_PRICE,
          },
        },
      });

      if (balanceUpdate.count !== 1) {
        throw new Error("Not enought funds");
      }

      const updatedUser = await tx.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });

      const createdEgg = await tx.egg.create({
        data: {
          userId,
          createdAt: new Date(),
          hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
        },
      });

      return { ...createdEgg, pgcBalance: updatedUser.pgcBalance.toString() };
    });
  }

  async startHatching(userId: number, id: number) {
    const hasOccupiedPixegotchiSlot =
      await this.pixegotchiService.hasOccupiedPixegotchiSlot(userId);
    if (hasOccupiedPixegotchiSlot)
      throw new Error("You already have an active Pixegotchi");

    const egg = await this.getEggById(userId, id);
    if (egg.isListed)
      throw new Error("You can't hatch egg listed in the market");
    if (egg.isHatching) throw new Error("Your egg is hatching");
    if (egg.isHatched) throw new Error("Egg is hatched");

    const updatedEgg = await prisma.egg.update({
      where: { id },
      data: {
        isHatching: true,
        hatchStartedAt: new Date(),
        tapCount: 0,
      },
    });

    return updatedEgg;
  }

  async cancelHatching(userId: number, id: number) {
    const egg = await prisma.egg.findFirst({
      where: {
        id,
        userId,
        isHatching: true,
      },
    });

    if (!egg) throw new Error("Egg not found");
    if (egg.isHatched) throw new Error("Egg is hatched");

    const updatedEgg = await prisma.egg.update({
      where: { id },
      data: {
        isHatching: false,
        hatchStartedAt: null,
        hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
        tapCount: 0,
      },
    });

    return updatedEgg;
  }

  async getHatchingStatus(userId: number, id: number) {
    const egg = await prisma.egg.findFirst({
      where: {
        id,
        userId,
        isHatching: true,
      },
    });
    if (!egg) throw new Error("Egg not found");

    if (!egg.isHatching || !egg.hatchStartedAt) {
      return {
        isHatching: false,
        remainingTimeMs: 0,
        canHatchNow: false,
        tapCount: 0,
        progress: 0,
      };
    }

    const currentTime = Date.now();
    const startTime = egg.hatchStartedAt.getTime();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max(0, egg.hatchingTimeMs - elapsedTime);
    const canHatchNow = remainingTime === 0;

    return {
      isHatching: true,
      remainingTimeMs: remainingTime,
      canHatchNow,
      tapCount: egg.tapCount,
      progress: Math.min(
        100,
        ((egg.hatchingTimeMs - remainingTime) / egg.hatchingTimeMs) * 100,
      ),
    };
  }

  async hatchEgg(userId: number, id: number, name?: string) {
    const egg = await prisma.egg.findFirst({
      where: {
        id,
        userId,
        isHatching: true,
      },
    });

    if (!egg) throw new Error("Egg not found or not hatching");
    if (egg.isHatched) throw new Error("Egg was hatched");

    const status = await this.getHatchingStatus(userId, id);

    if (!status.canHatchNow) {
      throw new Error(
        `Egg is not ready to hatch. Remaining time: ${Math.ceil(status.remainingTimeMs / 1000)}s`,
      );
    }

    const genome = GenomeGenerator.generate();
    assertValidGenomeHash(genome.genome_hash);

    const data = await prisma.$transaction(async (tx) => {
      const hasOccupiedPixegotchiSlot =
        await this.pixegotchiService.hasOccupiedPixegotchiSlot(userId, tx);
      if (hasOccupiedPixegotchiSlot)
        throw new Error("You already have an active Pixegotchi");

      const currentEgg = await tx.egg.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!currentEgg) throw new Error("Egg not found");
      if (currentEgg.isHatched) throw new Error("Egg was already hatched");
      if (!currentEgg.isHatching) throw new Error("Egg is not hatching");
      if (!currentEgg.hatchStartedAt) throw new Error("Egg hatching was not started");

      const elapsedTime = Date.now() - currentEgg.hatchStartedAt.getTime();
      const remainingTime = Math.max(0, currentEgg.hatchingTimeMs - elapsedTime);

      if (remainingTime > 0) {
        throw new Error(
          `Egg is not ready to hatch. Remaining time: ${Math.ceil(remainingTime / 1000)}s`,
        );
      }

      const pixegotchi = await tx.pixegotchi.create({
        data: {
          userId,
          name,
          eggId: id,
          genomeHash: genome.genome_hash,
          element: genome.element,
          rarity: genome.rarity,
          gender: genome.gender,
          traits: genome.traits,
          status: "active",

          health: CREATE_STATS.health,
          hunger: CREATE_STATS.hunger,
          energy: CREATE_STATS.energy,
          happiness: CREATE_STATS.happiness,
          cleanliness: CREATE_STATS.cleanliness,

          lastFedAt: new Date(),
          lastHealedAt: new Date(),
          lastPlayedAt: new Date(),
          lastCleanedAt: new Date(),
          lastBoostedAt: new Date(),
          lastSleptAt: new Date(),
          lastUpdateAt: new Date(),

          hatchedAt: new Date(),
        },
      });

      await tx.egg.update({
        where: { userId, id },
        data: {
          isHatched: true,
          hatchedAt: new Date(),
          isHatching: false,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          currentPixegotchiId: pixegotchi.id,
        },
      });

      return pixegotchi;
    });

    return data;
  }

  async proccessTapBatch(userId: number, eggId: number, tapCount: number) {
    const egg = await prisma.egg.findFirst({
      where: {
        id: eggId,
        userId,
        isHatching: true,
        isHatched: false,
      },
    });

    if (!egg) throw new Error("Egg not found or not hatching");
    if (!egg.hatchStartedAt) throw new Error("Egg hatching was not started");

    const maxTapPerBatch = EGG_CONSTANTS.EGG_MAX_BATCH_TAP;
    const actualTaps = Math.min(tapCount, maxTapPerBatch);

    const redisKey = `egg:${eggId}:taps:${userId}`;
    const redis = this.getRedis();
    const lastBatchTime = await redis.get(`${redisKey}:time`);

    if (lastBatchTime) {
      const timeSinceLastBatch = Date.now() - parseInt(lastBatchTime);

      if (timeSinceLastBatch < 500) {
        throw new Error("Too many requests. Please wait.");
      }
    }

    await redis.setex(`${redisKey}:time`, 60, Date.now().toString());

    const currentTime = Date.now();
    const startTime = egg.hatchStartedAt!.getTime();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max(0, egg.hatchingTimeMs - elapsedTime);

    const tapReduction = 1000 * actualTaps;
    const newRemainingTime = Math.max(0, remainingTime - tapReduction);

    await prisma.egg.update({
      where: {
        id: egg.id,
      },
      data: {
        tapCount: { increment: actualTaps },
        hatchingTimeMs: Math.floor(elapsedTime + newRemainingTime),
      },
    });

    const newStatus = await this.getHatchingStatus(userId, egg.id);

    return newStatus;
  }
}
