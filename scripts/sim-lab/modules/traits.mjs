import { simulationModule as statsModule } from "./stats.mjs";

const DEFAULT_STATS = {
  health: 100,
  hunger: 70,
  energy: 40,
  happiness: 20,
  cleanliness: 100,
};

const CARE_PROFILES = [
  {
    id: "no-care",
    label: "No care",
    notes: "No items used during the simulation.",
    schedule: [],
  },
  {
    id: "casual",
    label: "Casual care",
    notes: "Food and cleaning twice daily, play once daily.",
    schedule: [
      { itemId: "chicken", startHour: 12, repeatEveryHours: 12 },
      { itemId: "sponche", startHour: 12, repeatEveryHours: 12 },
      { itemId: "puzzle", startHour: 24, repeatEveryHours: 24 },
    ],
  },
  {
    id: "active",
    label: "Active care",
    notes: "Food and cleaning three times daily, play twice daily.",
    schedule: [
      { itemId: "chicken", startHour: 8, repeatEveryHours: 8 },
      { itemId: "sponche", startHour: 8, repeatEveryHours: 8 },
      { itemId: "puzzle", startHour: 12, repeatEveryHours: 12 },
    ],
  },
];

const ACTION_TYPE_BY_ITEM_TYPE = {
  food: "feed",
  cleaning: "clean",
  medicine: "heal",
  toy: "play",
  boost: "boost",
};

const GAME_SCORE = 100;
const GAME_ID = "catch_fruits";
const round = (value) => Number(value.toFixed(2));
const AUDITED_EFFECTS = [
  "game_energy_cost",
  "game_pgc_gain",
  "game_exp_gain",
  "game_chest_chance",
  "health_resilience",
  "happiness_gain",
  "play_happiness_gain",
];

function buildCombinationAudit(shared) {
  const traits = Object.keys(shared.TRAIT_EFFECTS);
  const effects = Object.fromEntries(
    AUDITED_EFFECTS.map((effect) => [
      effect,
      {
        min: { modifier: Infinity, traits: [] },
        max: { modifier: -Infinity, traits: [] },
      },
    ]),
  );
  let evaluated = 0;

  const evaluate = (combination) => {
    evaluated += 1;
    for (const effect of AUDITED_EFFECTS) {
      const modifier = shared.getTraitModifier(combination, effect);
      if (modifier < effects[effect].min.modifier) {
        effects[effect].min = { modifier, traits: [...combination] };
      }
      if (modifier > effects[effect].max.modifier) {
        effects[effect].max = { modifier, traits: [...combination] };
      }
    }
  };

  const visit = (start, combination, targetSize) => {
    if (combination.length === targetSize) {
      evaluate(combination);
      return;
    }
    for (
      let index = start;
      index <= traits.length - (targetSize - combination.length);
      index += 1
    ) {
      visit(index + 1, [...combination, traits[index]], targetSize);
    }
  };

  visit(0, [], 3);
  visit(0, [], 4);

  return { evaluated, traitCounts: [3, 4], effects };
}

function buildGameImpact(traits, shared) {
  const game = shared.GAME_CONFIGS[GAME_ID];
  if (!game) {
    throw new Error(`Unknown trait simulation game: ${GAME_ID}`);
  }

  const pgcModifier = shared.getTraitModifier(traits, "game_pgc_gain");
  const expModifier = shared.getTraitModifier(traits, "game_exp_gain");
  const chestModifier = shared.getTraitModifier(traits, "game_chest_chance");
  const maxHealth = shared.RARITY_STATS.legendary.maxStat;

  return {
    gameId: GAME_ID,
    score: GAME_SCORE,
    energyCost: shared.getFinalEnergyCost(
      maxHealth,
      "legendary",
      game.energyCost,
      traits,
    ),
    pgcEarned: round(GAME_SCORE * game.pgcPerPoint * pgcModifier),
    experienceGained: Math.floor(GAME_SCORE * game.expPerPoint * expModifier),
    chestChancePercent: round(
      Math.min(100, game.chestDropChance * chestModifier * 100),
    ),
    modifiers: {
      pgc: pgcModifier,
      experience: expModifier,
      chestChance: chestModifier,
      energyCost: shared.getTraitModifier(traits, "game_energy_cost"),
    },
  };
}

function buildCareProfiles(shared) {
  const itemsById = new Map(shared.ALL_ITEMS.map((item) => [item.itemId, item]));

  return CARE_PROFILES.map((profile) => ({
    ...profile,
    actions: profile.schedule.map((schedule) => {
      const item = itemsById.get(schedule.itemId);
      if (!item) {
        throw new Error(`Unknown trait simulation item: ${schedule.itemId}`);
      }

      return {
        ...schedule,
        type: ACTION_TYPE_BY_ITEM_TYPE[item.itemType] ?? "general",
        label: `${item.name} every ${schedule.repeatEveryHours}h`,
        effects: item.effects,
      };
    }),
  }));
}

function traitDefinition(trait, shared) {
  const config = shared.TRAIT_EFFECTS[trait];
  return {
    id: `trait-${trait}`,
    label: trait.replaceAll("_", " "),
    notes: `${config.rarity} ${config.isNegative ? "negative" : "positive"} trait`,
    rarity: "legendary",
    level: 1,
    traits: [trait],
    stats: DEFAULT_STATS,
  };
}

function scenariosForCareProfiles(definition, careProfiles) {
  return careProfiles.map((profile) => ({
    ...definition,
    id: `${definition.id}-${profile.id}`,
    label: `${definition.label} - ${profile.label}`,
    notes: `${definition.notes} ${profile.notes}`,
    careActions: profile.actions,
  }));
}

export const simulationModule = {
  id: "traits",
  title: "Trait Balance Simulation",
  run(config, context) {
    const allTraits = Object.keys(context.shared.TRAIT_EFFECTS);
    const combinations = config.combinations ?? [];
    const careProfiles = buildCareProfiles(context.shared);
    const definitions = [
      {
        id: "trait-baseline",
        label: "No traits baseline",
        notes: "Control scenario with the same rarity and starting stats.",
        rarity: "legendary",
        level: 1,
        traits: [],
        stats: DEFAULT_STATS,
      },
      ...allTraits.map((trait) => traitDefinition(trait, context.shared)),
      ...combinations.map((combination) => ({
        id: `combo-${combination.id}`,
        label: combination.label ?? combination.id,
        notes: combination.notes ?? "Selected multi-trait balance scenario.",
        rarity: "legendary",
        level: 1,
        traits: combination.traits,
        stats: DEFAULT_STATS,
      })),
    ];
    const scenarios = definitions.flatMap((definition) =>
      scenariosForCareProfiles(definition, careProfiles),
    );
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

    return {
      ...result,
      id: this.id,
      combinationAudit: buildCombinationAudit(context.shared),
      scenarios: result.scenarios.map((scenario) => ({
        ...scenario,
        gameImpact: buildGameImpact(scenario.traits, context.shared),
      })),
    };
  },
  toJson(result) {
    return result;
  },
};
