import { prisma } from "@/database/prisma";
import { PixegotchiStatus } from "../../../generated/prisma/enums";
import { Inventory } from "../inventory/inventory.service";
import { ItemEffectHandler } from "../inventory/item-effect-handler.service";
import { ItemEffects } from "@/types/item-effects";
import { Item, Pixegotchi } from "generated/prisma/client";
import { GenomeGenerator } from "../../utils/genome-generator";

interface PixegotchiCreate {
  name?: string;
  userId: number;
  genomeHash: string;
  element: string;
  rarity: string;
  gender: string;
  traits: string[];
  hungerRate: number;
  energyRate: number;
  diseaseResistance: number;
}

export class PixegotchiService {
  private inventory = new Inventory();

  // Get all user's tamagotchis
  async findByUserId(userId: number) {
    return await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  // Get active tamagotchi
  async findActive(userId: number) {
    const active = await prisma.pixegotchi.findFirst({
      where: { userId, status: "active" },
    });
    console.log("CONSOLE!:", active);
    return active;
  }

  // Get by ID with ownership check
  async findById(id: number, userId: number) {
    console.log("=== findById DEBUG ===");
    console.log("Called with id:", id, "userId:", userId);
    if (!id || isNaN(id)) {
      throw new Error("Invalid pixegotchi ID");
    }
    return await prisma.pixegotchi.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  private async validateItemUsage(
    pixegotchi: Pixegotchi,
    item: Item,
    quantity: number,
  ) {
    // Перевірка рівня
    if (item.minLevel && pixegotchi.level < item.minLevel) {
      throw new Error(
        `Pixegotchi must be level ${item.minLevel} to use this item`,
      );
    }

    // Перевірка кулдауну
    if (item.cooldownMinutes) {
      await this.checkCooldown(
        pixegotchi.userId,
        pixegotchi.id,
        item.itemId,
        item.cooldownMinutes,
      );
    }

    // Перевірка ліміту на день
    if (item.maxPerDay) {
      await this.checkDailyLimit(
        pixegotchi.userId,
        pixegotchi.id,
        item.itemId,
        item.maxPerDay,
      );
    }
  }

  private async checkCooldown(
    userId: number,
    pixegotchiId: number,
    itemId: string,
    cooldownMinutes: number,
  ) {
    const lastUsage = await prisma.itemUsageHistory.findFirst({
      where: { userId, pixegotchiId, itemId },
      orderBy: { usedAt: "desc" },
    });

    if (lastUsage) {
      const minutesSinceUse =
        (Date.now() - lastUsage.usedAt.getTime()) / (1000 * 60);

      if (minutesSinceUse < cooldownMinutes) {
        const remaining = Math.ceil(cooldownMinutes - minutesSinceUse);
        throw new Error(
          `Item is on cooldown. Available in ${remaining} minutes`,
        );
      }
    }
  }

  private async checkDailyLimit(
    userId: number,
    pixegotchiId: number,
    itemId: string,
    maxPerDay: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageToday = await prisma.itemUsageHistory.aggregate({
      where: {
        userId,
        pixegotchiId,
        itemId,
        usedAt: { gte: today },
      },
      _sum: { quantity: true },
    });

    const usedToday = usageToday._sum.quantity || 0;

    if (usedToday >= maxPerDay) {
      throw new Error(`Daily limit reached for this item (${maxPerDay}/day)`);
    }
  }

  private updateActionTimestamp(updates: any, itemType: string) {
    const timestampMap: Record<string, string> = {
      food: "lastFedAt",
      medicine: "lastHealedAt",
      cleaning: "lastCleanedAt",
      toy: "lastPlayedAt",
    };

    const field = timestampMap[itemType];
    if (field) {
      updates[field] = new Date();
    }
  }

  //Actions
  // async feed(id: number, userId: number, itemId: string) {
  //   const pixegotchi = await this.findById(id, userId);
  //   if (!pixegotchi) throw new Error("Pixegotchi now found");

  //   return await prisma.pixegotchi.update({
  //     where: { id },
  //     data: {
  //       hunger: Math.max(0, pixegotchi.hunger - 30),
  //       lastFedAt: new Date(),
  //       lastUpdateAt: new Date(),
  //     },
  //   });
  // }

  // async play(id: number, userId: number) {
  //   const pixegotchi = await this.findById(id, userId);
  //   if (!pixegotchi) throw new Error("Pixegotchi now found");
  //   return await prisma.pixegotchi.update({
  //     where: { id },
  //     data: {
  //       happiness: Math.min(100, pixegotchi.happiness + 20),
  //       energy: Math.max(0, pixegotchi.energy - 10),
  //       lastPlayedAt: new Date(),
  //       lastUpdateAt: new Date(),
  //     },
  //   });
  // }

  // async sleep(id: number, userId: number) {
  //   const pixegotchi = await this.findById(id, userId);
  //   if (!pixegotchi) throw new Error("Pixegotchi now found");

  //   return await prisma.pixegotchi.update({
  //     where: { id },
  //     data: {
  //       energy: Math.min(100, pixegotchi.energy + 40),
  //       lastSleptAt: new Date(),
  //       lastUpdateAt: new Date(),
  //     },
  //   });
  // }

  // async clean(id: number, userId: number) {
  //   const pixegotchi = await this.findById(id, userId);
  //   if (!pixegotchi) throw new Error("Pixegotchi now found");

  //   return await prisma.pixegotchi.update({
  //     where: { id },
  //     data: {
  //       cleanliness: 100,
  //       lastCleanedAt: new Date(),
  //       lastUpdateAt: new Date(),
  //     },
  //   });
  // }

  // async heal(id: number, userId: number) {
  //   const pixegotchi = await this.findById(id, userId);
  //   if (!pixegotchi) throw new Error("Pixegotchi now found");

  //   return await prisma.pixegotchi.update({
  //     where: { id },
  //     data: {
  //       health: Math.min(100, pixegotchi.health + 50),
  //       lastHealedAt: new Date(),
  //       lastUpdateAt: new Date(),
  //     },
  //   });
  // }

  // async updateStatus(id: number) {
  //   const pixegotchi = await prisma.pixegotchi.findUnique({
  //     where: { id },
  //   });

  //   if (!pixegotchi || pixegotchi.status !== "active") return;

  //   const hoursSinceUpdate = this.getHoursSince(pixegotchi.lastUpdateAt);

  //   if (hoursSinceUpdate < 12) return;

  //   const hungerRate = Number(pixegotchi.hungerRate);
  //   const energyRate = Number(pixegotchi.energyRate);

  //   const newHunger = Math.min(100, pixegotchi.hunger + 10 * hungerRate);
  //   const newEnergy = Math.max(0, pixegotchi.energy - 15 * energyRate);
  //   const newHappines = Math.max(0, pixegotchi.happiness - 5);
  //   const newCleanliness = Math.max(0, pixegotchi.cleanliness - 10);

  //   let newLives = pixegotchi.lives;
  //   let newStatus: PixegotchiStatus = pixegotchi.status;

  //   if (pixegotchi.hunger >= 100) {
  //     newLives = Math.max(0, newLives - 1);
  //     if (newLives === 0) {
  //       newStatus = "dead";
  //     }
  //   }

  //   return await prisma.pixegotchi.update({
  //     where: { id },
  //     data: {
  //       hunger: newHunger,
  //       energy: newEnergy,
  //       happiness: newHappines,
  //       cleanliness: newCleanliness,
  //       lives: newLives,
  //       status: newStatus,
  //       lastUpdateAt: new Date(),
  //     },
  //   });
  // }

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
