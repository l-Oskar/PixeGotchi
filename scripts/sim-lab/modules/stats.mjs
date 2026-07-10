const HOUR_MS = 3_600_000;
const STAT_KEYS = ["health", "hunger", "energy", "happiness", "cleanliness"];
const ACTION_TIMESTAMP_MAP = {
  feed: "lastFedAt",
  clean: "lastCleanedAt",
  heal: "lastHealedAt",
  play: "lastPlayedAt",
  boost: "lastBoostedAt",
  sleep: "lastSleptAt",
};
const THRESHOLDS = {
  health: [80, 50, 20, 0],
  hunger: [80, 40, 0],
  cleanliness: [80, 30, 0],
};

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function hoursBetween(startMs, timeMs) {
  return round((timeMs - startMs) / HOUR_MS, 4);
}

function buildBasePixegotchi(scenario, startAt, shared) {
  const stats = {
    ...shared.CREATE_STATS,
    ...(scenario.stats ?? {}),
  };

  return {
    id: 1,
    userId: 1,
    eggId: 1,
    nftAddress: null,
    genomeHash: "1770393107839-j5pytpw3rzf-557d1f910af4e0dbf5fe4add0576b038",
    element: scenario.element ?? "fire",
    rarity: scenario.rarity ?? "common",
    gender: scenario.gender ?? "male",
    traits: scenario.traits ?? [],
    name: scenario.label ?? scenario.id,
    status: "active",
    level: scenario.level ?? 1,
    experience: scenario.experience ?? 0,
    health: stats.health,
    hunger: stats.hunger,
    energy: stats.energy,
    happiness: stats.happiness,
    cleanliness: stats.cleanliness,
    healthZeroAt: null,
    criticalSince: null,
    lastFedAt: startAt,
    lastPlayedAt: startAt,
    lastSleptAt: startAt,
    lastCleanedAt: startAt,
    lastHealedAt: startAt,
    lastBoostedAt: startAt,
    lastUpdateAt: startAt,
    hatchedAt: startAt,
  };
}

function buildConstantOverrides(config) {
  const overrides = { ...(config.constantOverrides ?? {}) };
  delete overrides.notes;

  if (typeof overrides.criticalTimeHours === "number") {
    overrides.criticalTime = overrides.criticalTimeHours * HOUR_MS;
    delete overrides.criticalTimeHours;
  }

  if (typeof overrides.deadTimeHours === "number") {
    overrides.deadTime = overrides.deadTimeHours * HOUR_MS;
    delete overrides.deadTimeHours;
  }

  return overrides;
}

function updateLifecycleTimers(state, snapshot, now, shared, constantOverrides) {
  const next = { ...snapshot };
  const criticalTime = constantOverrides.criticalTime ?? shared.CRITICAL_TIME;

  if (snapshot.health <= 0 && !state.healthZeroAt) {
    next.healthZeroAt = now.toISOString();
  }

  if (
    (snapshot.status === "critical" || snapshot.status === "dead") &&
    !state.criticalSince
  ) {
    const healthZeroAt = next.healthZeroAt
      ? new Date(next.healthZeroAt).getTime()
      : now.getTime();
    next.criticalSince = new Date(healthZeroAt + criticalTime).toISOString();
  }

  return next;
}

function isActionDue(action, hour) {
  const startHour = Number(action.startHour ?? action.hour ?? 0);
  const repeatEveryHours = Number(action.repeatEveryHours ?? 0);
  const untilHour = Number(action.untilHour ?? Infinity);

  if (hour < startHour || hour > untilHour) return false;

  if (!repeatEveryHours) {
    return hour === startHour;
  }

  return (hour - startHour) % repeatEveryHours === 0;
}

function applyCareActions(state, snapshot, scenario, hour, now, shared) {
  const actions = scenario.careActions ?? [];
  const dueActions = actions.filter((action) => isActionDue(action, hour));
  if (dueActions.length === 0) {
    return { snapshot, appliedActions: [] };
  }

  const maxStat = shared.RARITY_STATS[snapshot.rarity].maxStat;
  const minimumHealth = shared.getTraitMinimumHealth(snapshot.traits);
  const next = { ...snapshot };
  const appliedActions = [];

  for (const action of dueActions) {
    for (const key of STAT_KEYS) {
      const effect = Number(action.effects?.[key] ?? 0);
      if (!Number.isFinite(effect) || effect === 0) continue;
      const happinessSource =
        action.type === "feed"
          ? "feed"
          : action.type === "play"
            ? "play"
            : "general";
      const traitModifier =
        key === "happiness" && effect > 0
          ? shared.getHappinessGainModifier(snapshot.traits, happinessSource)
          : 1;
      const minimum = key === "health" ? minimumHealth : 0;
      next[key] = round(
        Math.min(
          maxStat,
          Math.max(minimum, Number(next[key]) + effect * traitModifier),
        ),
      );
    }

    const timestampKey = ACTION_TIMESTAMP_MAP[action.type];
    if (timestampKey) {
      next[timestampKey] = now.toISOString();
    }

    appliedActions.push({
      hour,
      type: action.type,
      label: action.label ?? action.type,
      effects: action.effects ?? {},
      statsAfter: Object.fromEntries(
        STAT_KEYS.map((key) => [key, round(Number(next[key]))]),
      ),
      statusAfter: next.status,
    });
  }

  if (next.health > 0 && state.health <= 0) {
    next.status = "active";
    next.healthZeroAt = null;
    next.criticalSince = null;
  }

  return { snapshot: next, appliedActions };
}

function summarizeSeries(series, startMs) {
  const markers = {
    healthZeroAtHour: null,
    criticalAtHour: null,
    deadAtHour: null,
  };
  const thresholds = Object.fromEntries(
    Object.entries(THRESHOLDS).map(([stat, values]) => [
      stat,
      Object.fromEntries(values.map((value) => [value, null])),
    ]),
  );
  const minStats = Object.fromEntries(STAT_KEYS.map((key) => [key, Infinity]));
  const maxStats = Object.fromEntries(STAT_KEYS.map((key) => [key, -Infinity]));
  const actionCounts = {};
  const actionEvents = [];

  for (const point of series) {
    for (const key of STAT_KEYS) {
      minStats[key] = Math.min(minStats[key], point.stats[key]);
      maxStats[key] = Math.max(maxStats[key], point.stats[key]);
    }

    for (const [stat, values] of Object.entries(THRESHOLDS)) {
      for (const threshold of values) {
        if (
          thresholds[stat][threshold] === null &&
          point.stats[stat] <= threshold
        ) {
          thresholds[stat][threshold] = point.hour;
        }
      }
    }

    if (markers.healthZeroAtHour === null && point.stats.health <= 0) {
      markers.healthZeroAtHour = point.hour;
    }
    if (markers.criticalAtHour === null && point.status === "critical") {
      markers.criticalAtHour = point.hour;
    }
    if (markers.deadAtHour === null && point.status === "dead") {
      markers.deadAtHour = point.hour;
    }

    for (const action of point.actions ?? []) {
      actionCounts[action.type] = (actionCounts[action.type] ?? 0) + 1;
      actionEvents.push({
        hour: point.hour,
        computedAt: point.computedAt,
        ...action,
      });
    }
  }

  const finalPoint = series.at(-1);
  const finalStatus = finalPoint?.status ?? null;
  const finalHealth = finalPoint?.stats.health ?? 0;
  const outcome =
    finalStatus === "dead"
      ? "dead"
      : finalStatus === "critical"
        ? "critical"
        : markers.healthZeroAtHour !== null || finalHealth < 20
          ? "needs tuning"
          : "survived";
  const verdictReasons = [];

  if (markers.deadAtHour !== null) {
    verdictReasons.push(`dead reached at ${markers.deadAtHour}h`);
  }
  if (markers.criticalAtHour !== null) {
    verdictReasons.push(`critical reached at ${markers.criticalAtHour}h`);
  }
  if (markers.healthZeroAtHour !== null) {
    verdictReasons.push(`health reached zero at ${markers.healthZeroAtHour}h`);
  }
  if (thresholds.hunger[40] !== null) {
    verdictReasons.push(`hunger dropped below 40 at ${thresholds.hunger[40]}h`);
  }
  if (thresholds.cleanliness[30] !== null) {
    verdictReasons.push(
      `cleanliness dropped below 30 at ${thresholds.cleanliness[30]}h`,
    );
  }
  if (Object.keys(actionCounts).length > 0 && outcome !== "survived") {
    verdictReasons.push("configured care pattern was insufficient");
  }
  if (verdictReasons.length === 0) {
    verdictReasons.push("no critical balance issues detected");
  }

  return {
    ...markers,
    startAt: new Date(startMs).toISOString(),
    endAt: finalPoint?.computedAt ?? null,
    finalStatus,
    outcome,
    verdictReasons,
    finalStats: finalPoint?.stats ?? null,
    actionCounts,
    actionEvents,
    thresholds,
    minStats,
    maxStats,
  };
}

function simulateScenario(scenario, config, context, constantOverrides) {
  const { shared } = context;
  const startAt = new Date(config.startAt ?? "2026-01-01T00:00:00.000Z");
  const startMs = startAt.getTime();
  const hours = Number(config.hours ?? 168);
  const stepMinutes = Number(config.stepMinutes ?? (config.stepHours ?? 1) * 60);
  const stepMs = stepMinutes * 60_000;
  const totalMs = hours * HOUR_MS;
  let state = buildBasePixegotchi(scenario, startAt, shared);
  const series = [];

  for (let elapsedMs = 0; elapsedMs <= totalMs; elapsedMs += stepMs) {
    const now = new Date(startMs + elapsedMs);
    const hour = hoursBetween(startMs, now.getTime());
    const snapshot = shared.buildPixegotchiSnapshot(state, now, {
      constants: constantOverrides,
    });
    const snapshotWithTimers = updateLifecycleTimers(
      state,
      snapshot,
      now,
      shared,
      constantOverrides,
    );
    const { snapshot: finalSnapshot, appliedActions } = applyCareActions(
      state,
      snapshotWithTimers,
      scenario,
      hour,
      now,
      shared,
    );

    series.push({
      hour,
      computedAt: now.toISOString(),
      status: finalSnapshot.status,
      stats: Object.fromEntries(
        STAT_KEYS.map((key) => [key, round(Number(finalSnapshot[key]))]),
      ),
      actions: appliedActions,
      healthZeroAt: finalSnapshot.healthZeroAt,
      criticalSince: finalSnapshot.criticalSince,
    });

    state = {
      ...state,
      ...finalSnapshot,
      lastUpdateAt: now.toISOString(),
    };
  }

  return {
    id: scenario.id,
    label: scenario.label ?? scenario.id,
    notes: scenario.notes ?? "",
    level: state.level,
    rarity: state.rarity,
    traits: state.traits,
    startingStats: {
      ...shared.CREATE_STATS,
      ...(scenario.stats ?? {}),
    },
    careActions: scenario.careActions ?? [],
    checkpoints: Object.fromEntries(
      (config.checkpointHours ?? []).map((checkpointHour) => {
        const point = series.find((entry) => entry.hour === checkpointHour);
        return [checkpointHour, point ?? null];
      }),
    ),
    summary: summarizeSeries(series, startMs),
    series,
  };
}

function constantsSnapshot(shared) {
  return {
    createStats: shared.CREATE_STATS,
    rarityStats: shared.RARITY_STATS,
    criticalTimeHours: round(shared.CRITICAL_TIME / HOUR_MS, 2),
    deadTimeHours: round(shared.DEAD_TIME / HOUR_MS, 2),
  };
}

export const simulationModule = {
  id: "stats",
  title: "Stats Simulation",
  run(config, context) {
    const constantOverrides = buildConstantOverrides(config);

    return {
      id: this.id,
      title: config.title ?? this.title,
      generatedAt: context.generatedAt,
      config: {
        hours: Number(config.hours ?? 168),
        stepMinutes: Number(config.stepMinutes ?? (config.stepHours ?? 1) * 60),
        startAt: config.startAt ?? "2026-01-01T00:00:00.000Z",
        checkpointHours: config.checkpointHours ?? [],
      },
      constants: constantsSnapshot(context.shared),
      constantOverrides: config.constantOverrides ?? null,
      scenarios: (config.scenarios ?? []).map((scenario) =>
        simulateScenario(scenario, config, context, constantOverrides),
      ),
    };
  },
  toJson(result) {
    return result;
  },
};
