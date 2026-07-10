const moduleLoaders = {
  stats: () => import("./stats.mjs"),
  "care-balance": () => import("./care-balance.mjs"),
  genome: () => import("./genome.mjs"),
  chests: () => import("./chests.mjs"),
  items: () => import("./items.mjs"),
  traits: () => import("./traits.mjs"),
};

export function listSimulationModules() {
  return Object.keys(moduleLoaders);
}

export async function loadSimulationModule(moduleId) {
  const loader = moduleLoaders[moduleId];
  if (!loader) {
    throw new Error(
      `Unknown simulation module: ${moduleId}. Available modules: ${listSimulationModules().join(", ")}`,
    );
  }

  const loaded = await loader();
  const simulationModule = loaded.simulationModule;

  if (!simulationModule?.id || typeof simulationModule.run !== "function") {
    throw new Error(`Invalid simulation module contract: ${moduleId}`);
  }

  return simulationModule;
}
