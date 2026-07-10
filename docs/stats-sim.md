# Stats and Simulation Lab

This guide explains how to generate and use the repo-local simulation reports for
balancing PixeGotchi stats, genome generation, and future simulation modules.

The sim lab is a static report generator. It does not start a backend server and
does not write to the database.

## What It Generates

Main dashboard:

```text
reports/sim-lab/index.html
```

This is the file to open locally or serve through nginx. It contains a top
header menu with all available simulation modules.

Current modules:

- `care-balance` — real item-based care schedules, cooldown/max-per-day checks,
  stat degradation, survival, critical/dead timing.
- `stats` — stat degradation, lifecycle timing, care scenarios, critical/dead
  timing.
- `genome` — rarity, element, gender, trait, negative-trait, and score
  distributions.
- `chests` — random chest drop distribution, chest opening rewards, egg chance,
  item type distribution, item rarity distribution, and top items.
- `items` — item catalog, care effects, cooldowns, limits, and positive/negative
  stat impact charts.
- `traits` — every trait plus selected combinations, using the same care loop
  with 24-hour and 72-hour checkpoints.

Generated files:

```text
reports/sim-lab/
  index.html
  index.json
  care-balance-report.html
  care-balance-report.json
  stats-report.html
  stats-report.json
  genome-report.html
  genome-report.json
  chests-report.html
  chests-report.json
  items-report.html
  items-report.json
  traits-report.html
  traits-report.json
```

`reports/sim-lab/` is generated output and is ignored by git.

## Commands

List available modules:

```bash
npm run sim:list
```

Generate the full dashboard:

```bash
npm run sim:all
```

Generate only stats:

```bash
npm run stats:sim
```

Generate only care balance:

```bash
npm run care:sim
```

Generate only genome:

```bash
npm run genome:sim
```

Generate only chests:

```bash
npm run chests:sim
```

Generate only items:

```bash
npm run items:sim
```

Generate only trait balance:

```bash
npm run traits:sim
```

The commands build `packages/shared` first. This is intentional because sim-lab
imports the same `@pixegotchi/shared` package entrypoint that backend and
frontend code use.

## Local Viewing

After generation, open:

```text
reports/sim-lab/index.html
```

You can also open standalone module reports:

```text
reports/sim-lab/stats-report.html
reports/sim-lab/care-balance-report.html
reports/sim-lab/genome-report.html
reports/sim-lab/chests-report.html
reports/sim-lab/items-report.html
```

The HTML files are self-contained and do not need a dev server.

## Stats Module Workflow

Edit scenarios here:

```text
scripts/sim-lab/config/stats.scenarios.json
```

Useful fields:

- `hours` — total simulation window.
- `stepMinutes` — sampling interval for the report.
- `constantOverrides` — sandbox-only constants for tuning.
- `scenarios[].stats` — starting stats.
- `scenarios[].careActions` — simulated player actions.

Example sandbox override:

```json
{
  "constantOverrides": {
    "degradationStats": {
      "hunger": {
        "DECAY": 3
      },
      "cleanliness": {
        "DECAY": 2.5
      }
    }
  }
}
```

These overrides affect only the generated report. They do not change production
constants.

Use the stats report to check:

- when `hunger` or `cleanliness` crosses penalty thresholds;
- when `health` reaches `0`;
- when the Pixegotchi becomes `critical`;
- whether care actions are enough to recover or survive;
- whether changed constants make the gameplay too strict or too easy.

Lifecycle rule currently expected by tests:

```text
health <= 0
3 days later -> critical
3 more days -> dead
```

## Care Balance Module Workflow

Edit item-based care scenarios here:

```text
scripts/sim-lab/config/care-balance.scenarios.json
```

Useful fields:

- `hours` — total simulation window.
- `stepMinutes` — sampling interval for the report.
- `constantOverrides` — sandbox-only stat engine constants.
- `scenarios[].stats` — starting stats.
- `scenarios[].itemSchedule` — scheduled item usage.

Example item schedule:

```json
{
  "itemId": "peach",
  "startHour": 12,
  "repeatEveryHours": 12,
  "untilHour": 168
}
```

The module reads `ALL_ITEMS` from `@pixegotchi/shared`, applies item effects,
and respects each item's `cooldownMinutes` and `maxPerDay`. Blocked scheduled
uses are shown in the action events table, so the report can reveal when a care
plan looks good on paper but cannot actually run because of item limits.

Use the care report to check:

- whether cheap, mid-tier, or premium care loops can survive a week;
- whether once-daily care is enough;
- whether twice-daily care is too strong or still insufficient;
- how toy-heavy play affects hunger, cleanliness, and energy;
- how cooldowns and max-per-day limits affect a planned care loop.

## Genome Module Workflow

Edit genome simulation config here:

```text
scripts/sim-lab/config/genome.scenarios.json
```

Useful fields:

- `sampleSize` — number of generated genomes.
- `seed` — deterministic seed for repeatable results.
- `startAt` — timestamp base for deterministic hash generation.
- `topCount` — number of top genomes shown in the report.

The genome module uses `GenomeGenerator` from `@pixegotchi/shared`, so it tests
the same generation logic used by the app.

Use the genome report to check:

- rarity distribution;
- element distribution;
- gender distribution;
- trait distribution;
- negative trait count distribution;
- top generated genomes by score;
- `legendary + rainbow + immortal_soul` frequency.

## Chests Module Workflow

Edit chest simulation config here:

```text
scripts/sim-lab/config/chests.scenarios.json
```

Useful fields:

- `randomChestSampleSize` — number of random chest drops to generate.
- `openPerChestType` — number of openings per chest type.
- `seed` — deterministic seed for repeatable results.
- `topItems` — number of top dropped items shown per chest type.

The chests module uses `ChestGenerator` from `@pixegotchi/shared`, so it tests
the same chest logic used by backend rewards and frontend previews.

Use the chests report to check:

- random chest drop distribution;
- average value per chest type;
- average item count per chest;
- egg drop chance per chest type;
- item type distribution;
- item rarity distribution;
- most common dropped items.

## Items Module Workflow

Edit source item constants under:

```text
packages/shared/src/constants/items/
```

The report reads `ALL_ITEMS` from `@pixegotchi/shared`, so it uses the same item
catalog as backend/frontend code.

Use the items report to check:

- item count by type and rarity;
- stackable item count;
- cooldown and max-per-day coverage;
- strongest positive effects for `hunger`, `health`, `cleanliness`,
  `happiness`, and `energy`;
- negative side effects, such as toys reducing cleanliness or food reducing
  cleanliness;
- top care items by combined positive stat value;
- the full item catalog with effects and limits.

## Server Generation

On the server:

```bash
cd /path/to/PixeGotchi
npm run sim:all
```

This regenerates:

```text
reports/sim-lab/index.html
```

You can run it manually after changing constants/configs, or later wire it into a
small deploy/admin script.

## Nginx Static Hosting

Serve the generated directory as static files:

```nginx
location /sim-lab/ {
  alias /path/to/PixeGotchi/reports/sim-lab/;
  index index.html;
  try_files $uri $uri/ /sim-lab/index.html;
}
```

Then open:

```text
https://your-domain.example/sim-lab/
```

If nginx runs in Docker, make sure `reports/sim-lab/` is mounted into the nginx
container or copied into the served static directory.

## Adding A New Module

Add config:

```text
scripts/sim-lab/config/<module>.scenarios.json
```

Add module implementation:

```text
scripts/sim-lab/modules/<module>.mjs
```

Register it:

```text
scripts/sim-lab/modules/index.mjs
```

Module contract:

```js
export const simulationModule = {
  id: "module-id",
  title: "Module Title",
  run(config, context) {},
  toJson(result) {
    return result;
  },
};
```

If the module needs game logic, prefer moving pure logic into
`packages/shared/src` first and importing it from `@pixegotchi/shared`. Do not
copy product formulas directly into sim-lab scripts.

## Recommended Checks

After changing sim-lab or shared game formulas:

```bash
npm run sim:all
npm run typecheck --workspace=packages/shared
npm test --workspace=packages/backend -- shared-utils
```

If backend imports changed or shared exports were added:

```bash
npm run typecheck --workspace=packages/backend
```

Run backend `typecheck` after `packages/shared` has been built, because backend
imports the built shared package entrypoint.
