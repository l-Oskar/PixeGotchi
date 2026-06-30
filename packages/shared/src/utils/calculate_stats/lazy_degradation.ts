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

  const hunger = clampStat(
    baseStats.hunger +
      calculateDelta(
        getFinalHungerDelta(pixegotchi.level, pixegotchi.rarity),
        elapsedMs,
      ),
    maxStat,
  );
  const cleanliness = clampStat(
    baseStats.cleanliness +
      calculateDelta(
        getFinalCleanlinessDelta(pixegotchi.level, pixegotchi.rarity),
        elapsedMs,
      ),
    maxStat,
  );
  const happiness = clampStat(
    baseStats.happiness +
      calculateDelta(
        getFinalHappinessDelta(
          pixegotchi.level,
          hunger,
          cleanliness,
          pixegotchi.rarity,
        ),
        elapsedMs,
      ),
    maxStat,
  );
  const energy = clampStat(
    baseStats.energy +
      calculateDelta(
        getFinalEnergyDelta(
          pixegotchi.level,
          hunger,
          baseStats.health,
          pixegotchi.rarity,
        ),
        elapsedMs,
      ),
    maxStat,
  );
  const health = clampStat(
    baseStats.health +
      calculateDelta(
        getFinalHealthDelta(
          pixegotchi.level,
          hunger,
          cleanliness,
          pixegotchi.rarity,
        ),
        elapsedMs,
      ),
    maxStat,
  );

  return {
    health,
    hunger,
    energy,
    happiness,
    cleanliness,
  };
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

  const criticalStartedAt =
    toTime(pixegotchi.criticalSince) ?? toTime(pixegotchi.healthZeroAt);

  if (criticalStartedAt && now.getTime() - criticalStartedAt >= DEAD_TIME) {
    return PixegotchiStatus.dead;
  }

  if (
    criticalStartedAt &&
    now.getTime() - criticalStartedAt >= CRITICAL_TIME
  ) {
    return PixegotchiStatus.critical;
  }

  return PixegotchiStatus.critical;
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
