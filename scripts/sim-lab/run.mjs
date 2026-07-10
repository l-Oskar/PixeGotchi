import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as shared from "@pixegotchi/shared";
import { renderDashboardHtml, renderHtml } from "./render-html.mjs";
import {
  listSimulationModules,
  loadSimulationModule,
} from "./modules/index.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const outputDir = path.join(repoRoot, "reports/sim-lab");

function createSeededRng(seedText = "pixegotchi") {
  let seed = 0;
  for (const char of seedText) {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  }

  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function runModule(moduleId, context) {
  const simModule = await loadSimulationModule(moduleId);
  const configPath = path.join(__dirname, "config", `${moduleId}.scenarios.json`);
  const config = await readJson(configPath);
  const result = simModule.run(config, context);

  return simModule.toJson(result, context);
}

async function writeModuleReport(moduleId, jsonResult, context) {
  const html = renderHtml(jsonResult, context);

  await writeFile(
    path.join(outputDir, `${moduleId}-report.json`),
    `${JSON.stringify(jsonResult, null, 2)}\n`,
  );
  await writeFile(path.join(outputDir, `${moduleId}-report.html`), html);

  console.log(`Generated ${path.relative(repoRoot, path.join(outputDir, `${moduleId}-report.html`))}`);
  console.log(`Generated ${path.relative(repoRoot, path.join(outputDir, `${moduleId}-report.json`))}`);
}

async function main() {
  const moduleId = process.argv[2] ?? "stats";
  if (moduleId === "--list" || moduleId === "list") {
    console.log(listSimulationModules().join("\n"));
    return;
  }

  const generatedAt = new Date().toISOString();
  const context = {
    createSeededRng,
    generatedAt,
    shared,
    rng: createSeededRng(`${moduleId}:${generatedAt}`),
  };

  await mkdir(outputDir, { recursive: true });

  if (moduleId === "all" || moduleId === "dashboard") {
    const results = [];
    for (const id of listSimulationModules()) {
      const moduleContext = {
        ...context,
        rng: createSeededRng(`${id}:${generatedAt}`),
      };
      const jsonResult = await runModule(id, moduleContext);
      await writeModuleReport(id, jsonResult, moduleContext);
      results.push(jsonResult);
    }

    const dashboardHtml = renderDashboardHtml(results, context);
    await writeFile(path.join(outputDir, "index.html"), dashboardHtml);
    await writeFile(
      path.join(outputDir, "index.json"),
      `${JSON.stringify({ generatedAt, modules: results }, null, 2)}\n`,
    );
    console.log(`Generated ${path.relative(repoRoot, path.join(outputDir, "index.html"))}`);
    console.log(`Generated ${path.relative(repoRoot, path.join(outputDir, "index.json"))}`);
    return;
  }

  const jsonResult = await runModule(moduleId, context);
  await writeModuleReport(moduleId, jsonResult, context);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
