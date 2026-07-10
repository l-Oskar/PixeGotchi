const STAT_KEYS = ["hunger", "health", "cleanliness", "happiness", "energy"];

function round(value, digits = 2) {
  return Number(value.toFixed(digits));
}

function countBy(values, keyFn) {
  return values.reduce((acc, value) => {
    const key = keyFn(value);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
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

function getEffect(item, key) {
  return Number(item.effects?.[key] ?? 0);
}

function getCareScore(item) {
  return (
    Math.max(0, getEffect(item, "hunger")) +
    Math.max(0, getEffect(item, "health")) +
    Math.max(0, getEffect(item, "cleanliness")) +
    Math.max(0, getEffect(item, "happiness")) +
    Math.max(0, getEffect(item, "energy"))
  );
}

function buildEffectStats(items, topCount) {
  return Object.fromEntries(
    STAT_KEYS.map((stat) => {
      const nonZeroItems = items
        .map((item) => ({
          itemId: item.itemId,
          name: item.name,
          itemType: item.itemType,
          rarity: item.rarity,
          value: getEffect(item, stat),
        }))
        .filter((item) => item.value !== 0);

      return [
        stat,
        {
          positive: nonZeroItems
            .filter((item) => item.value > 0)
            .sort((a, b) => b.value - a.value || a.itemId.localeCompare(b.itemId))
            .slice(0, topCount),
          negative: nonZeroItems
            .filter((item) => item.value < 0)
            .sort((a, b) => a.value - b.value || a.itemId.localeCompare(b.itemId))
            .slice(0, topCount),
          totalPositive: nonZeroItems.filter((item) => item.value > 0).length,
          totalNegative: nonZeroItems.filter((item) => item.value < 0).length,
        },
      ];
    }),
  );
}

export const simulationModule = {
  id: "items",
  title: "Items Catalog Simulation",
  run(config, context) {
    const items = context.shared.ALL_ITEMS.map((item) => ({
      itemId: item.itemId,
      name: item.name,
      itemType: item.itemType,
      rarity: item.rarity,
      effects: item.effects ?? {},
      cooldownMinutes: item.cooldownMinutes,
      maxPerDay: item.maxPerDay,
      minLevel: item.minLevel,
      isStackable: item.isStackable,
      maxStack: item.maxStack,
      careScore: getCareScore(item),
    }));
    const topCount = Number(config.topEffects ?? 12);

    return {
      id: this.id,
      title: config.title ?? this.title,
      generatedAt: context.generatedAt,
      config: {
        topEffects: topCount,
      },
      summary: {
        totalItems: items.length,
        stackableItems: items.filter((item) => item.isStackable).length,
        limitedPerDayItems: items.filter((item) => item.maxPerDay !== null).length,
        cooldownItems: items.filter((item) => Number(item.cooldownMinutes ?? 0) > 0).length,
      },
      distributions: {
        byType: toDistribution(countBy(items, (item) => item.itemType), items.length),
        byRarity: toDistribution(countBy(items, (item) => item.rarity), items.length),
      },
      effectStats: buildEffectStats(items, topCount),
      topCareItems: [...items]
        .sort((a, b) => b.careScore - a.careScore || a.itemId.localeCompare(b.itemId))
        .slice(0, topCount),
      items,
    };
  },
  toJson(result) {
    return result;
  },
};
