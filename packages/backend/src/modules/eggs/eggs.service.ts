import { prisma } from "@/database/prisma";
import { GenomeGenerator } from "@/utils/genome-generator";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";

const EGG_PRICE = 999;
const HATCHING_TIME = 10000; //86400000

export class EggService {
  private pixegotchiService = new PixegotchiService();

  async findAllEggs(userId: number) {
    const eggs = await prisma.egg.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (eggs.length < 1) throw new Error("You don't have eggs");

    return eggs;
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

  async createEgg(userId: number) {
    return await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user) throw new Error("User not found");
      if (Number(user.pgcBalance) < EGG_PRICE)
        throw new Error("Not enought funds");

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          pgcBalance: {
            decrement: 999,
          },
        },
      });

      const createdEgg = await prisma.egg.create({
        data: {
          userId,
          createdAt: new Date(),
        },
      });

      return createdEgg;
    });
  }

  async startHatching(userId: number, id: number) {
    const activePixegitchi = await this.pixegotchiService.findActive(userId);
    if (activePixegitchi)
      throw new Error("You already have an active Pixegotchi");

    const egg = await this.getEggById(userId, id);
    if (egg.isListed)
      throw new Error("You can't hatch egg listed in the market");
    if (egg.isHatching) throw new Error("Your egg is hatching");

    const updatedEgg = await prisma.egg.update({
      where: { id },
      data: {
        isHatching: true,
        hatchStartedAt: new Date(),
        hatchingTimeMs: HATCHING_TIME,
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

    const updatedEgg = await prisma.egg.update({
      where: { id },
      data: {
        isHatching: false,
        hatchStartedAt: null,
        hatchingTimeMs: HATCHING_TIME,
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

    const status = await this.getHatchingStatus(userId, id);

    if (!status.canHatchNow) {
      throw new Error(
        `Egg is not ready to hatch. Remaining time: ${Math.ceil(status.remainingTimeMs / 1000)}s`,
      );
    }

    const genome = GenomeGenerator.generate();

    const data = await prisma.$transaction([
      prisma.pixegotchi.create({
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

          health: 100,
          hunger: 70,
          energy: 100,
          happiness: 50,
          cleanliness: 100,

          hatchedAt: new Date(),
        },
      }),
      prisma.egg.delete({ where: { userId, id } }),
    ]);

    return data[0];
  }
}
