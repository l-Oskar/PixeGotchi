import {
  CRITICAL_TIME,
  DEAD_TIME,
  RARITY_STATS,
} from "../../constants/pixegotchi_const";
import { PixegotchiStatus } from "../../enums";
import type {
  Pixegotchi,
  PixegotchiStats,
} from "../../types/pixegotchi";
import { calculateDelta, round } from "./calculate_delta";
import { getFinalCleanlinessDelta } from "./calculate_cleanliness";
import { getFinalEnergyDelta } from "./calculate_energy";
import { getFinalHappinessDelta } from "./calculate_happiness";
import { getFinalHealthDelta } from "./calculate_health";
import { getFinalHungerDelta } from "./calculate_hunger";

export type PixegotchiSnapshot = Omit<
  Pixegotchi,
  "health" | "hunger" | "energy" | "happiness" | "cleanliness" | "status"
> &
  PixegotchiStats & {
    status: PixegotchiStatus;
    computedAt: string;
    elapsedMs: number;
  };

const toNumber = (value: number | string, fallback = 0) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toTime = (value: Date | string | null) => {
  if (!value) return null;
  const time =
    value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};

const clampStat = (value: number, maxStat: number) =>
  round(Math.min(maxStat, Math.max(0, value)));
const DEGRADATION_STEP_MS = 3_600_000;

const getElapsedMs = (pixegotchi: Pixegotchi, now: Date) => {
  const lastUpdateTime = toTime(pixegotchi.lastUpdateAt);
  if (!lastUpdateTime) return 0;

  return Math.max(0, now.getTime() - lastUpdateTime);
};

export function calculateCurrentStats(
  pixegotchi: Pixegotchi,
  now = new Date(),
): PixegotchiStats {
  const maxStat = RARITY_STATS[pixegotchi.rarity].maxStat;
  const baseStats: PixegotchiStats = {
    health: clampStat(toNumber(pixegotchi.health), maxStat),
    hunger: clampStat(toNumber(pixegotchi.hunger), maxStat),
    energy: clampStat(toNumber(pixegotchi.energy), maxStat),
    happiness: clampStat(toNumber(pixegotchi.happiness), maxStat),
    cleanliness: clampStat(toNumber(pixegotchi.cleanliness), maxStat),
  };

  if (
    pixegotchi.status === PixegotchiStatus.vault ||
    pixegotchi.status === PixegotchiStatus.dead
  ) {
    return baseStats;
  }

  const elapsedMs = getElapsedMs(pixegotchi, now);
  if (elapsedMs === 0) return baseStats;

  const stats = { ...baseStats };
  let remainingMs = elapsedMs;

  while (remainingMs > 0) {
    const stepMs = Math.min(remainingMs, DEGRADATION_STEP_MS);

    stats.hunger = clampStat(
      stats.hunger +
        calculateDelta(
          getFinalHungerDelta(pixegotchi.level, pixegotchi.rarity),
          stepMs,
        ),
      maxStat,
    );
    stats.cleanliness = clampStat(
      stats.cleanliness +
        calculateDelta(
          getFinalCleanlinessDelta(pixegotchi.level, pixegotchi.rarity),
          stepMs,
        ),
      maxStat,
    );
    stats.happiness = clampStat(
      stats.happiness +
        calculateDelta(
          getFinalHappinessDelta(
            pixegotchi.level,
            stats.hunger,
            stats.cleanliness,
            pixegotchi.rarity,
          ),
          stepMs,
        ),
      maxStat,
    );
    stats.energy = clampStat(
      stats.energy +
        calculateDelta(
          getFinalEnergyDelta(
            pixegotchi.level,
            stats.hunger,
            stats.health,
            pixegotchi.rarity,
          ),
          stepMs,
        ),
      maxStat,
    );
    stats.health = clampStat(
      stats.health +
        calculateDelta(
          getFinalHealthDelta(
            pixegotchi.level,
            stats.hunger,
            stats.cleanliness,
            pixegotchi.rarity,
          ),
          stepMs,
        ),
      maxStat,
    );

    remainingMs -= stepMs;
  }

  return stats;
}

export function derivePixegotchiStatus(
  pixegotchi: Pixegotchi,
  stats: PixegotchiStats,
  now = new Date(),
): PixegotchiStatus {
  if (
    pixegotchi.status === PixegotchiStatus.vault ||
    pixegotchi.status === PixegotchiStatus.dead
  ) {
    return pixegotchi.status;
  }

  if (stats.health > 0) return PixegotchiStatus.active;

  const criticalSince = toTime(pixegotchi.criticalSince);
  if (criticalSince) {
    if (now.getTime() - criticalSince >= DEAD_TIME) {
      return PixegotchiStatus.dead;
    }

    return PixegotchiStatus.critical;
  }

  const healthZeroAt = toTime(pixegotchi.healthZeroAt);
  if (!healthZeroAt) return PixegotchiStatus.active;

  const timeSinceHealthZero = now.getTime() - healthZeroAt;
  if (timeSinceHealthZero >= CRITICAL_TIME + DEAD_TIME) {
    return PixegotchiStatus.dead;
  }

  if (timeSinceHealthZero >= CRITICAL_TIME) {
    return PixegotchiStatus.critical;
  }

  return PixegotchiStatus.active;
}

export function buildPixegotchiSnapshot(
  pixegotchi: Pixegotchi,
  now = new Date(),
): PixegotchiSnapshot {
  const stats = calculateCurrentStats(pixegotchi, now);
  const status = derivePixegotchiStatus(pixegotchi, stats, now);

  return {
    ...pixegotchi,
    ...stats,
    status,
    computedAt: now.toISOString(),
    elapsedMs: getElapsedMs(pixegotchi, now),
  };
}
