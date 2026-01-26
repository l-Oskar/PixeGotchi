import { prisma } from "@/database/prisma";
import { PixegotchiStatus, Prisma } from "@prisma/client";

export class PixegotchiService {
  // Get all user's tamagotchis
  async findByUserId(userId: number) {
    return await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Get active tamagotchi
  async findActive(userId: number) {
    return await prisma.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });
  }

  // Get by ID with ownership check
  async findById(id: number, userId: number) {
    return await prisma.pixegotchi.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  //Create new pixegotchi from egg
  async create(data: {
    userId: number;
    genomeHash: string;
    element: string;
    rarity: string;
    hungerRate: number;
    energyRate: number;
    diseaseResistance: number;
  }) {
    return await prisma.pixegotchi.create({
      data: {
        userId: data.userId,
        genomeHash: data.genomeHash,
        element: data.element as any,
        rarity: data.rarity as any,
        hungerRate: data.hungerRate,
        energyRate: data.energyRate,
        diseaseResistance: data.diseaseResistance,
        status: "egg",
      },
    });
  }

  //Hatching
  async hatchEgg(id: number, userId: number, name?: string) {
    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        status: "active",
        name: name || "Unnamed",
        hatchedAt: new Date(),
      },
    });
  }

  //Actions
  async feed(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi now found");

    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        hunger: Math.max(0, pixegotchi.hunger - 30),
        lastFedAt: new Date(),
        lastUpdateAt: new Date(),
      },
    });
  }

  async play(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi now found");
    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        happiness: Math.min(100, pixegotchi.happiness + 20),
        energy: Math.max(0, pixegotchi.energy - 10),
        lastPlayedAt: new Date(),
        lastUpdateAt: new Date(),
      },
    });
  }

  async sleep(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi now found");

    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        energy: Math.min(100, pixegotchi.energy + 40),
        lastSleptAt: new Date(),
        lastUpdateAt: new Date(),
      },
    });
  }

  async clean(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi now found");

    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        cleanliness: 100,
        lastCleanedAt: new Date(),
        lastUpdateAt: new Date(),
      },
    });
  }

  async heal(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi now found");

    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        health: Math.min(100, pixegotchi.health + 50),
        lastHealedAt: new Date(),
        lastUpdateAt: new Date(),
      },
    });
  }

  async updateStatus(id: number) {
    const pixegotchi = await prisma.pixegotchi.findUnique({
      where: { id },
    });

    if (!pixegotchi || pixegotchi.status !== "active") return;

    const hoursSinceUpdate = this.getHoursSince(pixegotchi.lastUpdateAt);

    if (hoursSinceUpdate < 12) return;

    const hungerRate = Number(pixegotchi.hungerRate);
    const energyRate = Number(pixegotchi.energyRate);

    const newHunger = Math.min(100, pixegotchi.hunger + 10 * hungerRate);
    const newEnergy = Math.max(0, pixegotchi.energy - 15 * energyRate);
    const newHappines = Math.max(0, pixegotchi.happiness - 5);
    const newCleanliness = Math.max(0, pixegotchi.cleanliness - 10);

    let newLives = pixegotchi.lives;
    let newStatus: PixegotchiStatus = pixegotchi.status;

    if (pixegotchi.hunger >= 100) {
      newLives = Math.max(0, newLives - 1);
      if (newLives === 0) {
        newStatus = "dead";
      }
    }

    return await prisma.pixegotchi.update({
      where: { id },
      data: {
        hunger: newHunger,
        energy: newEnergy,
        happiness: newHappines,
        cleanliness: newCleanliness,
        lives: newLives,
        status: newStatus,
        lastUpdateAt: new Date(),
      },
    });
  }

  async storedInVault(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi now found");

    if (pixegotchi.level % 10 !== 0)
      throw new Error("Can only store at levels 10, 20, 30...");

    return await prisma.$transaction(async (tx) => {
      await tx.pixegotchi.update({
        where: { id },
        data: {
          status: "vault",
        },
      });

      return await tx.vault.create({
        data: {
          userId,
          pixegotchiId: id,
          finalLevel: pixegotchi.level,
        },
      });
    });
  }

  private getHoursSince(date: Date) {
    return Date.now() - date.getTime() / (1000 * 60 * 60);
  }
}
