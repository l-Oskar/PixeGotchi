import { prisma } from "@/database/prisma";
import { GenomeGenerator } from "@/utils/genome-generator";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";
import { CREATE_STATS, EGG_CONSTANTS, assertValidGenomeHash } from "@pixegotchi/shared";
import Redis from "ioredis";

export class EggService {
  private pixegotchiService = new PixegotchiService();
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!);
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
    return await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new Error("User not found");
      if (Number(user.pgcBalance) < EGG_CONSTANTS.EGG_PRICE)
        throw new Error("Not enought funds");

      const newBalance = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          pgcBalance: {
            decrement: EGG_CONSTANTS.EGG_PRICE,
          },
        },
      });

      const createdEgg = await prisma.egg.create({
        data: {
          userId,
          createdAt: new Date(),
          hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
        },
      });

      return { ...createdEgg, pgcBalance: newBalance.pgcBalance.toString() };
    });
  }

  async startHatching(userId: number, id: number) {
    const activePixegotchi = await this.pixegotchiService.findActive(userId);
    if (activePixegotchi)
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

    const data = await prisma.$transaction(async (prisma) => {
      const currentEgg = await prisma.egg.findFirst({
        where: {
          id,
          userId,
        },
      });

      if (!currentEgg) throw new Error("Egg not found");
      if (currentEgg.isHatched) throw new Error("Egg was already hatched");
      if (!currentEgg.isHatching) throw new Error("Egg is not hatching");

      const pixegotchi = await prisma.pixegotchi.create({
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

      await prisma.egg.update({
        where: { userId, id },
        data: {
          isHatched: true,
          hatchedAt: new Date(),
          isHatching: false,
        },
      });

      return pixegotchi;
    });

    return data;
  }

  async proccessTapBatch(userId: number, eggId: number, tapCount: number) {
    const egg = await this.getHatchingEgg(userId);

    if (!egg) throw new Error("Egg not found or not hatching");
    if (egg.isHatched) return;

    const maxTapPerBatch = EGG_CONSTANTS.EGG_MAX_BATCH_TAP;
    const actualTaps = Math.min(tapCount, maxTapPerBatch);

    const redisKey = `egg:${eggId}:taps:${userId}`;
    const lastBatchTime = await this.redis.get(`${redisKey}:time`);

    if (lastBatchTime) {
      const timeSinceLastBatch = Date.now() - parseInt(lastBatchTime);

      if (timeSinceLastBatch < 500) {
        throw new Error("Too many requests. Please wait.");
      }
    }

    await this.redis.setex(`${redisKey}:time`, 60, Date.now().toString());

    const currentTime = Date.now();
    const startTime = egg.hatchStartedAt!.getTime();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max(0, egg.hatchingTimeMs - elapsedTime);

    const tapReduction = 1000 * actualTaps;
    const newRemainingTime = Math.max(0, remainingTime - tapReduction);

    await prisma.egg.update({
      where: {
        id: eggId,
      },
      data: {
        tapCount: { increment: actualTaps },
        hatchingTimeMs: Math.floor(elapsedTime + newRemainingTime),
      },
    });

    const newStatus = this.getHatchingStatus(userId, eggId);

    return newStatus;
  }
}
