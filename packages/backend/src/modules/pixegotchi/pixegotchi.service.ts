import { prisma } from "@/database/prisma";
import {
  buildPixegotchiSnapshot,
  CRITICAL_TIME,
  Item,
  ITEM_EXP,
  MAX_EXP,
  PixegotchiSnapshot,
  RARE_CANDY_EXP,
  RARITY_STATS,
  RarityType,
  derivePixegotchiStatus,
} from "@pixegotchi/shared";
import type {
  Pixegotchi as PrismaPixegotchi,
  Prisma,
} from "@/generated/prisma/client";

type PrismaExecutor = typeof prisma | Prisma.TransactionClient;
type StatEffectKey = Extract<
  keyof NonNullable<Item["effects"]>,
  "health" | "hunger" | "energy" | "happiness" | "cleanliness"
>;
type HealthTimerSource = {
  healthZeroAt: Date | string | null;
  criticalSince: Date | string | null;
};

const OCCUPIED_SLOT_STATUSES = ["active", "critical", "dead"] as const;
const MAX_LEVEL = 100;

const toPersistedStat = (value: number) => Math.round(value);
const toDate = (value: Date | string | null) =>
  value instanceof Date ? value : value ? new Date(value) : null;

const getCriticalSince = (pixegotchi: HealthTimerSource, now: Date) => {
  const criticalSince = toDate(pixegotchi.criticalSince);
  if (criticalSince) return criticalSince;

  const healthZeroAt = toDate(pixegotchi.healthZeroAt);
  if (!healthZeroAt) return now;

  return new Date(healthZeroAt.getTime() + CRITICAL_TIME);
};

export class PixegotchiService {
  private async toSnapshot(
    pixegotchi: PrismaPixegotchi,
    db: PrismaExecutor = prisma,
  ): Promise<PixegotchiSnapshot> {
    const now = new Date();
    const snapshot = buildPixegotchiSnapshot(pixegotchi, now);
    const healthZeroStarted =
      snapshot.status === "active" &&
      snapshot.health <= 0 &&
      !pixegotchi.healthZeroAt;
    const criticalStarted =
      (snapshot.status === "critical" || snapshot.status === "dead") &&
      !pixegotchi.criticalSince;

    if (
      snapshot.status === pixegotchi.status &&
      !healthZeroStarted &&
      !criticalStarted
    ) {
      return snapshot;
    }

    const enteredBlockedState =
      snapshot.status === "critical" || snapshot.status === "dead";
    const healthZeroAt = toDate(pixegotchi.healthZeroAt) ?? now;
    const criticalSince = getCriticalSince(pixegotchi, now);

    const updatedPixegotchi = await db.pixegotchi.update({
      where: { id: pixegotchi.id },
      data: {
        status: snapshot.status,
        health: toPersistedStat(snapshot.health),
        hunger: toPersistedStat(snapshot.hunger),
        energy: toPersistedStat(snapshot.energy),
        happiness: toPersistedStat(snapshot.happiness),
        cleanliness: toPersistedStat(snapshot.cleanliness),
        lastUpdateAt: now,
        healthZeroAt:
          snapshot.status === "active" && snapshot.health > 0
            ? null
            : enteredBlockedState
              ? healthZeroAt
              : healthZeroStarted
                ? now
                : pixegotchi.healthZeroAt,
        criticalSince:
          snapshot.status === "active"
            ? null
            : enteredBlockedState
              ? criticalSince
              : pixegotchi.criticalSince,
      },
    });

    return buildPixegotchiSnapshot(updatedPixegotchi, now);
  }

  async findByUserId(userId: number): Promise<PixegotchiSnapshot[]> {
    const pixegotchis = await prisma.pixegotchi.findMany({
      where: { userId },
      orderBy: { hatchedAt: "desc" },
    });

    return await Promise.all(
      pixegotchis.map((pixegotchi) => this.toSnapshot(pixegotchi)),
    );
  }

  async findCurrent(
    userId: number,
    db: PrismaExecutor = prisma,
  ): Promise<PixegotchiSnapshot | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { currentPixegotchi: true },
    });

    const current = user?.currentPixegotchi;

    if (!current || current.userId !== userId) return null;
    if (!OCCUPIED_SLOT_STATUSES.some((status) => status === current.status))
      return null;

    return await this.toSnapshot(current, db);
  }

  async findActive(userId: number): Promise<PixegotchiSnapshot | null> {
    return await this.findCurrent(userId);
  }

  async hasOccupiedPixegotchiSlot(userId: number, db: PrismaExecutor = prisma) {
    return (await this.findCurrent(userId, db)) !== null;
  }

  async setInActive(userId: number) {
    const active = await this.findCurrent(userId);

    if (!active) {
      throw new Error("No active pixegotchi");
    }

    if (active.status === "dead" || active.status === "critical") {
      throw new Error("Dead pixegotchi cannot be stored in vault");
    }

    return await prisma.$transaction(async (tx) => {
      const updatedPixegotchi = await tx.pixegotchi.update({
        where: { id: active.id },
        data: {
          status: "vault",
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          currentPixegotchiId: null,
        },
      });

      return updatedPixegotchi;
    });
  }

  // Get by ID with ownership check
  async findById(
    id: number,
    userId: number,
  ): Promise<PixegotchiSnapshot | null> {
    const pixegotchi = await prisma.pixegotchi.findFirst({
      where: {
        id,
        userId,
      },
    });

    return pixegotchi ? await this.toSnapshot(pixegotchi) : null;
  }

  async storedInVault(id: number, userId: number) {
    const pixegotchi = await this.findById(id, userId);
    if (!pixegotchi) throw new Error("Pixegotchi not found");

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

  async applyStats(
    userId: number,
    item: Item,
    quantity: number = 1,
    db: PrismaExecutor = prisma,
  ) {
    const pixegotchi = await this.findCurrent(userId, db);

    if (!pixegotchi) throw new Error("You don't have active pixegotchi");
    if (pixegotchi.status !== "active")
      throw new Error("Pixegotchi is not active");

    await this.addItemExp(userId, item, quantity, db);

    const maxStat = RARITY_STATS[pixegotchi.rarity as RarityType].maxStat;

    const TIMESTAMP_MAP: Record<StatEffectKey, string> = {
      hunger: "lastFedAt",
      health: "lastHealedAt",
      happiness: "lastPlayedAt",
      cleanliness: "lastCleanedAt",
      energy: "lastBoostedAt",
    };

    const statKeys = Object.keys(TIMESTAMP_MAP) as StatEffectKey[];

    const nextStats = {
      health: pixegotchi.health,
      hunger: pixegotchi.hunger,
      energy: pixegotchi.energy,
      happiness: pixegotchi.happiness,
      cleanliness: pixegotchi.cleanliness,
    };
    const now = new Date();
    const data: Record<string, unknown> = {
      lastUpdateAt: now,
    };

    for (const stat of statKeys) {
      const effectValue = item.effects?.[stat];
      if (!effectValue || typeof effectValue !== "number") continue;

      nextStats[stat] = Math.min(
        maxStat,
        Math.max(0, nextStats[stat] + effectValue * quantity),
      );
      data[TIMESTAMP_MAP[stat]!] = now;
    }

    const status = derivePixegotchiStatus(pixegotchi, nextStats, now);
    const healthZeroAt = toDate(pixegotchi.healthZeroAt) ?? now;
    const enteredBlockedState = status === "critical" || status === "dead";

    return await db.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data: {
        ...data,
        health: toPersistedStat(nextStats.health),
        hunger: toPersistedStat(nextStats.hunger),
        energy: toPersistedStat(nextStats.energy),
        happiness: toPersistedStat(nextStats.happiness),
        cleanliness: toPersistedStat(nextStats.cleanliness),
        status,
        healthZeroAt:
          status === "active" && nextStats.health > 0
            ? null
            : enteredBlockedState
              ? healthZeroAt
              : nextStats.health <= 0
                ? healthZeroAt
                : pixegotchi.healthZeroAt,
        criticalSince:
          status === "active"
            ? null
            : enteredBlockedState
              ? getCriticalSince(pixegotchi, now)
              : pixegotchi.criticalSince,
      },
    });
  }

  async addItemExp(
    userId: number,
    item: Item,
    quantity: number = 1,
    db: PrismaExecutor = prisma,
  ) {
    let exp = 0;

    if (item.itemId === "rare_candy") {
      exp = RARE_CANDY_EXP * quantity;
    } else {
      exp = ITEM_EXP[item.rarity] * quantity;
    }

    return await this.addExp(userId, exp, db);
  }

  async addExp(userId: number, exp: number, db: PrismaExecutor = prisma) {
    const pixegotchi = await this.findCurrent(userId, db);

    if (!pixegotchi) throw new Error("Not active pixegotchi");
    if (pixegotchi.status !== "active")
      throw new Error("Pixegotchi is not active");

    const totalExp = pixegotchi.experience + exp;
    const gainedLevels = Math.floor(totalExp / MAX_EXP);
    const nextLevel = Math.min(MAX_LEVEL, pixegotchi.level + gainedLevels);
    const nextExperience =
      nextLevel >= MAX_LEVEL ? MAX_EXP : totalExp % MAX_EXP;

    return await db.pixegotchi.update({
      where: {
        id: pixegotchi.id,
      },
      data: {
        experience: nextExperience,
        level: nextLevel,
      },
    });
  }

  async checkStatus(userId: number) {
    const time = Date.now();
    const currentPixegotchi = await this.findCurrent(userId);

    if (!currentPixegotchi) return null;

    const getDiffMs = (date: Date | string | null) => {
      if (!date) return null;

      const dateTime =
        date instanceof Date ? date.getTime() : new Date(date).getTime();
      return Number.isFinite(dateTime) ? time - dateTime : null;
    };

    const lastUpdates = {
      lastFedDiffMs: getDiffMs(currentPixegotchi.lastFedAt),
      lastHealedDiffMs: getDiffMs(currentPixegotchi.lastHealedAt),
      lastCleanedDiffMs: getDiffMs(currentPixegotchi.lastCleanedAt),
      lastPlayedDiffMs: getDiffMs(currentPixegotchi.lastPlayedAt),
      lastBoostedDiffMs: getDiffMs(currentPixegotchi.lastBoostedAt),
      lastUpdatedDiffMs: getDiffMs(currentPixegotchi.lastUpdateAt),
    };

    return lastUpdates;
  }
}
