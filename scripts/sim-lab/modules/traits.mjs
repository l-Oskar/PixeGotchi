import { simulationModule as statsModule } from "./stats.mjs";

const DEFAULT_STATS = {
  health: 100,
  hunger: 70,
  energy: 40,
  happiness: 20,
  cleanliness: 100,
};

const CARE_ACTIONS = [
  {
    type: "feed",
    label: "Feed every 12h",
    startHour: 12,
    repeatEveryHours: 12,
    effects: { hunger: 30, happiness: 10 },
  },
  {
    type: "play",
    label: "Play every 12h",
    startHour: 12,
    repeatEveryHours: 12,
    effects: { happiness: 15, energy: -10, cleanliness: -5 },
  },
  {
    type: "clean",
    label: "Clean every 24h",
    startHour: 24,
    repeatEveryHours: 24,
    effects: { cleanliness: 40 },
  },
];

function traitScenario(trait, shared) {
  const config = shared.TRAIT_EFFECTS[trait];
  return {
    id: `trait-${trait}`,
    label: trait.replaceAll("_", " "),
    notes: `${config.rarity} ${config.isNegative ? "negative" : "positive"} trait`,
    rarity: "legendary",
    level: 1,
    traits: [trait],
    stats: DEFAULT_STATS,
    careActions: CARE_ACTIONS,
  };
}

export const simulationModule = {
  id: "traits",
  title: "Trait Balance Simulation",
  run(config, context) {
    const allTraits = Object.keys(context.shared.TRAIT_EFFECTS);
    const combinations = config.combinations ?? [];
    const scenarios = [
      {
        id: "trait-baseline",
        label: "No traits baseline",
        notes: "Control scenario with the same rarity, stats, and care schedule.",
        rarity: "legendary",
        level: 1,
        traits: [],
        stats: DEFAULT_STATS,
        careActions: CARE_ACTIONS,
      },
      ...allTraits.map((trait) => traitScenario(trait, context.shared)),
      ...combinations.map((combination) => ({
        id: `combo-${combination.id}`,
        label: combination.label ?? combination.id,
        notes: combination.notes ?? "Selected multi-trait balance scenario.",
        rarity: "legendary",
        level: 1,
        traits: combination.traits,
        stats: DEFAULT_STATS,
        careActions: CARE_ACTIONS,
      })),
    ];
    const result = statsModule.run(
      {
        ...config,
        title: config.title ?? this.title,
        hours: 72,
        stepMinutes: 60,
        checkpointHours: [24, 72],
        scenarios,
      },
      context,
    );

    return { ...result, id: this.id };
  },
  toJson(result) {
    return result;
  },
};
