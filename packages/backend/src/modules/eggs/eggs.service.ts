import { prisma } from "@/database/prisma";
import { GenomeGenerator } from "@/utils/genome-generator";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";

const EGG_PRICE = 999;

export class EggService {
  private pixegotchiService = new PixegotchiService();

  async findByUserId(userId: number) {
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
          isListed: false,
          createdAt: new Date(),
        },
      });

      return createdEgg;
    });
  }

  async hatchEgg(userId: number, id: number, name?: string) {
    const egg = await this.getEggById(userId, id);
    if (egg.isListed)
      throw new Error("You can't hatch egg listed in the market");

    const activePixegitchi = await this.pixegotchiService.findActive(userId);
    if (activePixegitchi != null) throw new Error("You have active Pixegotchi");
    const genome = GenomeGenerator.generate();

    const data = await prisma.$transaction([
      prisma.egg.delete({ where: { userId, id } }),

      prisma.pixegotchi.create({
        data: {
          userId,
          name,
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

          createdAt: new Date(),
        },
      }),
    ]);

    return data[1];
  }
}
