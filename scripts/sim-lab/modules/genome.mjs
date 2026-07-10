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
      percentage: round((count / total) * 100, 2),
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

function createScenarioRng(context, config) {
  return context.createSeededRng(
    `${config.seed ?? "genome"}:${config.sampleSize ?? 10000}`,
  );
}

function generateSamples(config, context) {
  const sampleSize = Number(config.sampleSize ?? 10000);
  const startAt = new Date(config.startAt ?? "2026-01-01T00:00:00.000Z");
  const rng = createScenarioRng(context, config);

  return Array.from({ length: sampleSize }, (_, index) =>
    context.shared.GenomeGenerator.generate({
      rng,
      now: startAt.getTime() + index,
    }),
  );
}

export const simulationModule = {
  id: "genome",
  title: "Genome Simulation",
  run(config, context) {
    const samples = generateSamples(config, context);
    const topCount = Number(config.topCount ?? 20);
    const scoredSamples = samples
      .map((genome) => ({
        genome,
        score: context.shared.GenomeGenerator.getGenomeStats(genome),
      }))
      .sort((a, b) => b.score.totalScore - a.score.totalScore);
    const negativeTraitCounts = countBy(samples, (genome) =>
      String(
        genome.traits.filter((trait) =>
          context.shared.isNegativeTrait(trait),
        ).length,
      ),
    );
    const holyGrail = samples.filter(
      (genome) =>
        genome.rarity === "legendary" &&
        genome.element === "rainbow" &&
        genome.traits.includes("immortal_soul"),
    );

    return {
      id: this.id,
      title: config.title ?? this.title,
      generatedAt: context.generatedAt,
      config: {
        sampleSize: samples.length,
        seed: config.seed ?? "genome-v1",
        startAt: config.startAt ?? "2026-01-01T00:00:00.000Z",
        topCount,
      },
      summary: {
        totalGenerated: samples.length,
        averageScore: round(
          scoredSamples.reduce((sum, item) => sum + item.score.totalScore, 0) /
            samples.length,
          2,
        ),
        holyGrailCount: holyGrail.length,
        holyGrailPercentage: round((holyGrail.length / samples.length) * 100, 6),
      },
      distributions: {
        rarity: toDistribution(
          countBy(samples, (genome) => genome.rarity),
          samples.length,
        ),
        element: toDistribution(
          countBy(samples, (genome) => genome.element),
          samples.length,
        ),
        gender: toDistribution(
          countBy(samples, (genome) => genome.gender),
          samples.length,
        ),
        traits: toDistribution(
          countBy(
            samples.flatMap((genome) => genome.traits),
            (trait) => trait,
          ),
          samples.length,
        ),
        negativeTraitCounts: toDistribution(negativeTraitCounts, samples.length),
      },
      topGenomes: scoredSamples.slice(0, topCount),
    };
  },
  toJson(result) {
    return result;
  },
};
