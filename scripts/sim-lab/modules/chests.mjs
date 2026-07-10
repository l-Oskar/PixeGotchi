const CHEST_TYPES = ["wooden", "silver", "golden", "crystal", "mythic", "legendary"];
const ITEM_TYPES = ["food", "medicine", "cleaning", "toy", "boost", "special", "chest"];
const RARITIES = ["common", "uncommon", "rare", "epic", "mythic", "legendary"];

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function createEmptyCounts(keys) {
  return Object.fromEntries(keys.map((key) => [key, 0]));
}

function toDistribution(counts, total) {
  return Object.entries(counts)
    .map(([id, count]) => ({
      id,
      count,
      percentage: total > 0 ? round((count / total) * 100, 2) : 0,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

function simulateRandomChestDrops(config, context) {
  const sampleSize = Number(config.randomChestSampleSize ?? 10000);
  const rng = context.createSeededRng(`${config.seed ?? "chests"}:drops:${sampleSize}`);
  const counts = createEmptyCounts(CHEST_TYPES);

  for (let index = 0; index < sampleSize; index++) {
    const chest = context.shared.ChestGenerator.generateRandomChest({ rng });
    counts[chest.chestType] += 1;
  }

  return {
    sampleSize,
    distribution: toDistribution(counts, sampleSize),
  };
}

function simulateChestOpenings(chestType, config, context) {
  const openCount = Number(config.openPerChestType ?? 5000);
  const rng = context.createSeededRng(`${config.seed ?? "chests"}:open:${chestType}:${openCount}`);
  const itemTypeCounts = createEmptyCounts(ITEM_TYPES);
  const itemRarityCounts = createEmptyCounts(RARITIES);
  const itemCounts = {};
  let eggDrops = 0;
  let totalItems = 0;
  let totalValue = 0;

  for (let index = 0; index < openCount; index++) {
    const rewards = context.shared.ChestGenerator.openChest(chestType, { rng });
    totalValue += rewards.totalValue;
    if (rewards.egg) eggDrops += 1;

    for (const item of rewards.items) {
      totalItems += item.quantity;
      itemTypeCounts[item.type] += item.quantity;
      itemRarityCounts[item.rarity] += item.quantity;

      const key = `${item.type}:${item.itemId}`;
      if (!itemCounts[key]) {
        itemCounts[key] = {
          itemId: item.itemId,
          type: item.type,
          rarity: item.rarity,
          quantity: 0,
          occurrences: 0,
        };
      }

      itemCounts[key].quantity += item.quantity;
      itemCounts[key].occurrences += 1;
    }
  }

  const topItems = Object.values(itemCounts)
    .sort((a, b) => b.occurrences - a.occurrences || a.itemId.localeCompare(b.itemId))
    .slice(0, Number(config.topItems ?? 12))
    .map((item) => ({
      ...item,
      dropChance: round((item.occurrences / openCount) * 100, 2),
      averagePerChest: round(item.quantity / openCount, 4),
    }));

  return {
    chestType,
    description: context.shared.ChestGenerator.getChestDescription(chestType),
    summary: {
      opened: openCount,
      averageValue: round(totalValue / openCount, 2),
      averageItemsPerChest: round(totalItems / openCount, 3),
      eggDrops,
      eggChance: round((eggDrops / openCount) * 100, 2),
      totalItems,
    },
    itemTypeDistribution: toDistribution(itemTypeCounts, totalItems),
    itemRarityDistribution: toDistribution(itemRarityCounts, totalItems),
    topItems,
  };
}

export const simulationModule = {
  id: "chests",
  title: "Chest Simulation",
  run(config, context) {
    return {
      id: this.id,
      title: config.title ?? this.title,
      generatedAt: context.generatedAt,
      config: {
        seed: config.seed ?? "chests-v1",
        randomChestSampleSize: Number(config.randomChestSampleSize ?? 10000),
        openPerChestType: Number(config.openPerChestType ?? 5000),
        topItems: Number(config.topItems ?? 12),
      },
      randomChestDrops: simulateRandomChestDrops(config, context),
      chests: CHEST_TYPES.map((chestType) =>
        simulateChestOpenings(chestType, config, context),
      ),
    };
  },
  toJson(result) {
    return result;
  },
};
