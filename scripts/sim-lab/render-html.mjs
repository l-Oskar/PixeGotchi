const STAT_COLORS = {
  health: "#ff5c73",
  hunger: "#ffaa45",
  energy: "#ffd95a",
  happiness: "#ff6ad5",
  cleanliness: "#5cc8ff",
};

const STAT_KEYS = Object.keys(STAT_COLORS);
const SCENARIO_COLORS = [
  "#c084fc",
  "#52d273",
  "#5cc8ff",
  "#ffaa45",
  "#ff6ad5",
  "#ffd95a",
  "#ff5c73",
  "#a78bfa",
];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

function formatHour(hour) {
  if (hour === null || hour === undefined) return "not reached";
  if (hour < 24) return `${Number(hour).toFixed(1)}h`;
  return `${Number(hour / 24).toFixed(2)}d`;
}

function statPath(series, key, width, height, padding, maxStat) {
  const maxHour = Math.max(...series.map((point) => point.hour), 1);
  return series
    .map((point, index) => {
      const x = padding + (point.hour / maxHour) * (width - padding * 2);
      const y =
        padding +
        (1 - Number(point.stats[key]) / maxStat) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function renderLineGrid(width, height, padding, maxHour, maxStat) {
  const yStep = 10;
  const yMax = Math.max(100, Math.ceil(maxStat / yStep) * yStep);
  const xStep = maxHour > 72 ? 24 : Math.max(1, Math.ceil(maxHour / 6));
  const horizontal = [];
  const vertical = [];

  for (let value = 0; value <= yMax; value += yStep) {
    const y = padding + (1 - value / yMax) * (height - padding * 2);
    horizontal.push(`
      <line x1="${padding}" y1="${y.toFixed(2)}" x2="${width - padding}" y2="${y.toFixed(2)}" stroke="#514467" stroke-width="${value % 50 === 0 ? "1" : ".6"}" opacity="${value % 50 === 0 ? ".72" : ".38"}" />
      <text x="${padding - 8}" y="${(y + 4).toFixed(2)}" fill="#b8a8cc" font-size="10" text-anchor="end">${value}</text>
    `);
  }

  for (let hour = 0; hour <= maxHour; hour += xStep) {
    const x = padding + (hour / Math.max(maxHour, 1)) * (width - padding * 2);
    vertical.push(`
      <line x1="${x.toFixed(2)}" y1="${padding}" x2="${x.toFixed(2)}" y2="${height - padding}" stroke="#514467" stroke-width=".6" opacity=".32" />
      <text x="${x.toFixed(2)}" y="${height - 10}" fill="#b8a8cc" font-size="10" text-anchor="${hour === 0 ? "start" : hour >= maxHour ? "end" : "middle"}">${escapeHtml(formatHour(hour))}</text>
    `);
  }

  return `${horizontal.join("")}${vertical.join("")}`;
}

function renderBarGrid() {
  const lines = [];

  for (let value = 0; value <= 100; value += 10) {
    lines.push(`
      <div class="bar-grid-line" style="bottom:${value}%">
        <span>${value}</span>
      </div>
    `);
  }

  return `<div class="bar-grid" aria-hidden="true">${lines.join("")}</div>`;
}

function markerLine(hour, maxHour, width, height, padding, color, label) {
  if (hour === null || hour === undefined) return "";
  const x = padding + (hour / Math.max(maxHour, 1)) * (width - padding * 2);
  return `
    <line x1="${x.toFixed(2)}" y1="${padding}" x2="${x.toFixed(2)}" y2="${height - padding}" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 5" />
    <text x="${(x + 5).toFixed(2)}" y="${padding + 14}" fill="${color}" font-size="11">${escapeHtml(label)}</text>
  `;
}

function actionMarkers(series, maxHour, width, height, padding) {
  return series
    .filter((point) => point.actions?.length)
    .map((point) => {
      const label = point.actions.map((action) => action.type).join("+");
      return markerLine(
        point.hour,
        maxHour,
        width,
        height,
        padding,
        "#52d273",
        label,
      );
    })
    .join("");
}

function renderHealthComparison(scenarios) {
  const width = 920;
  const height = 320;
  const padding = 36;
  const maxHour = Math.max(
    ...scenarios.flatMap((scenario) => scenario.series.map((point) => point.hour)),
    1,
  );
  const paths = scenarios.map((scenario, index) => {
    const color = SCENARIO_COLORS[index % SCENARIO_COLORS.length];
    const d = scenario.series
      .map((point, pointIndex) => {
        const x = padding + (point.hour / maxHour) * (width - padding * 2);
        const y =
          padding +
          (1 - Number(point.stats.health) / 100) * (height - padding * 2);
        return `${pointIndex === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" />`;
  }).join("");

  return `
    <section class="panel">
      <h2>Health Comparison</h2>
      <p>All scenarios on one chart. This is the fastest view for balance tuning.</p>
      <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Health comparison chart">
        <rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#15111f" />
        ${renderLineGrid(width, height, padding, maxHour, 100)}
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#514467" />
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#514467" />
        ${paths}
      </svg>
      <div class="legend">
        ${scenarios.map((scenario, index) => `
          <span><i style="background:${SCENARIO_COLORS[index % SCENARIO_COLORS.length]}"></i>${escapeHtml(scenario.label)}</span>
        `).join("")}
      </div>
    </section>
  `;
}

function renderChart(scenario) {
  const width = 920;
  const height = 320;
  const padding = 36;
  const maxStat = Math.max(
    100,
    Math.ceil(Math.max(...STAT_KEYS.map((key) => scenario.summary.maxStats[key])) / 10) * 10,
  );
  const maxHour = Math.max(...scenario.series.map((point) => point.hour), 1);

  const paths = STAT_KEYS.map(
    (key) => `
      <path d="${statPath(scenario.series, key, width, height, padding, maxStat)}" fill="none" stroke="${STAT_COLORS[key]}" stroke-width="2.5" />
    `,
  ).join("");

  return `
    <svg class="chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(scenario.label)} stats chart">
      <rect x="0" y="0" width="${width}" height="${height}" rx="10" fill="#15111f" />
      ${renderLineGrid(width, height, padding, maxHour, maxStat)}
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#514467" />
      <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#514467" />
      ${paths}
      ${actionMarkers(scenario.series, maxHour, width, height, padding)}
      ${markerLine(scenario.summary.thresholds.hunger[40], maxHour, width, height, padding, "#ffaa45", "hunger<40")}
      ${markerLine(scenario.summary.thresholds.cleanliness[30], maxHour, width, height, padding, "#5cc8ff", "clean<30")}
      ${markerLine(scenario.summary.thresholds.health[20], maxHour, width, height, padding, "#ff5c73", "health<20")}
      ${markerLine(scenario.summary.healthZeroAtHour, maxHour, width, height, padding, "#f97316", "health=0")}
      ${markerLine(scenario.summary.criticalAtHour, maxHour, width, height, padding, "#d7263d", "critical")}
      ${markerLine(scenario.summary.deadAtHour, maxHour, width, height, padding, "#a78bfa", "dead")}
    </svg>
  `;
}

function renderLegend() {
  return `
    <div class="legend">
      ${STAT_KEYS.map(
        (key) => `
          <span><i style="background:${STAT_COLORS[key]}"></i>${escapeHtml(key)}</span>
        `,
      ).join("")}
    </div>
  `;
}

function renderThresholdGrid(scenario) {
  const cells = [
    ["Hunger < 80", scenario.summary.thresholds.hunger[80]],
    ["Hunger < 40", scenario.summary.thresholds.hunger[40]],
    ["Hunger = 0", scenario.summary.thresholds.hunger[0]],
    ["Clean < 80", scenario.summary.thresholds.cleanliness[80]],
    ["Clean < 30", scenario.summary.thresholds.cleanliness[30]],
    ["Clean = 0", scenario.summary.thresholds.cleanliness[0]],
    ["Health < 80", scenario.summary.thresholds.health[80]],
    ["Health < 50", scenario.summary.thresholds.health[50]],
    ["Health < 20", scenario.summary.thresholds.health[20]],
  ];

  return `
    <div class="threshold-grid">
      ${cells.map(([label, hour]) => `
        <div><strong>${escapeHtml(label)}</strong><span>${escapeHtml(formatHour(hour))}</span></div>
      `).join("")}
    </div>
  `;
}

function renderActionSummary(scenario) {
  const entries = Object.entries(scenario.summary.actionCounts ?? {});
  if (entries.length === 0) {
    return `<p class="action-note">No care actions configured.</p>`;
  }

  return `
    <div class="action-list">
      ${entries.map(([type, count]) => `
        <span>${escapeHtml(type)}: ${escapeHtml(count)}</span>
      `).join("")}
    </div>
  `;
}

function renderVerdictReasons(scenario) {
  const reasons = scenario.summary.verdictReasons ?? [];
  return `
    <div class="verdict">
      <strong>Verdict reasons</strong>
      <ul>
        ${reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function renderActionEventsTable(scenario) {
  const events = scenario.summary.actionEvents ?? [];
  if (events.length === 0) {
    return "";
  }

  return `
    <details class="action-events">
      <summary>Action events (${events.length})</summary>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Hour</th>
              <th>Action</th>
              <th>Effects</th>
              <th>Stats after action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${events.map((event) => `
              <tr>
                <td>${escapeHtml(formatHour(event.hour))}</td>
                <td>${escapeHtml(event.label ?? event.type)}</td>
                <td><code>${escapeHtml(JSON.stringify(event.effects))}</code></td>
                <td><code>${escapeHtml(JSON.stringify(event.statsAfter))}</code></td>
                <td>${escapeHtml(event.statusAfter)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </details>
  `;
}

function outcomeClass(outcome) {
  return `outcome-${String(outcome ?? "unknown").replaceAll(" ", "-")}`;
}

function renderScenario(scenario) {
  return `
    <section class="scenario">
      <div class="scenario-head">
        <div>
          <h2>${escapeHtml(scenario.label)}</h2>
          <p>${escapeHtml(scenario.rarity)} / level ${escapeHtml(scenario.level)}</p>
          ${scenario.notes ? `<p class="notes">${escapeHtml(scenario.notes)}</p>` : ""}
        </div>
        <div class="status ${outcomeClass(scenario.summary.outcome)}">${escapeHtml(scenario.summary.outcome)}</div>
      </div>
      ${renderChart(scenario)}
      ${renderLegend()}
      <div class="summary-grid">
        <div><strong>Health zero</strong><span>${escapeHtml(formatHour(scenario.summary.healthZeroAtHour))}</span></div>
        <div><strong>Critical</strong><span>${escapeHtml(formatHour(scenario.summary.criticalAtHour))}</span></div>
        <div><strong>Dead</strong><span>${escapeHtml(formatHour(scenario.summary.deadAtHour))}</span></div>
        <div><strong>Outcome</strong><span>${escapeHtml(scenario.summary.outcome)}</span></div>
      </div>
      ${renderActionSummary(scenario)}
      ${renderVerdictReasons(scenario)}
      ${renderThresholdGrid(scenario)}
      ${renderActionEventsTable(scenario)}
      <details>
        <summary>Final stats and starting stats</summary>
        <pre>${escapeHtml(JSON.stringify({
          startingStats: scenario.startingStats,
          notes: scenario.notes,
          careActions: scenario.careActions,
          finalStats: scenario.summary.finalStats,
          outcome: scenario.summary.outcome,
          verdictReasons: scenario.summary.verdictReasons,
          actionCounts: scenario.summary.actionCounts,
          actionEvents: scenario.summary.actionEvents,
          thresholds: scenario.summary.thresholds,
          minStats: scenario.summary.minStats,
        }, null, 2))}</pre>
      </details>
    </section>
  `;
}

function renderScenarioTable(scenarios) {
  return `
    <table>
      <thead>
        <tr>
          <th>Scenario</th>
          <th>Rarity</th>
          <th>Level</th>
          <th>Health = 0</th>
          <th>Critical</th>
          <th>Dead</th>
          <th>Actions</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>
        ${scenarios.map(
          (scenario) => `
            <tr>
              <td>${escapeHtml(scenario.label)}</td>
              <td>${escapeHtml(scenario.rarity)}</td>
              <td>${escapeHtml(scenario.level)}</td>
              <td>${escapeHtml(formatHour(scenario.summary.healthZeroAtHour))}</td>
              <td>${escapeHtml(formatHour(scenario.summary.criticalAtHour))}</td>
              <td>${escapeHtml(formatHour(scenario.summary.deadAtHour))}</td>
              <td>${escapeHtml(Object.values(scenario.summary.actionCounts ?? {}).reduce((sum, count) => sum + count, 0))}</td>
              <td><span class="table-outcome ${outcomeClass(scenario.summary.outcome)}">${escapeHtml(scenario.summary.outcome)}</span></td>
            </tr>
          `,
        ).join("")}
      </tbody>
    </table>
  `;
}

function renderStatsHtml(result) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(result.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0614;
      --panel: #201535;
      --panel-soft: #2a1d45;
      --border: #5f3e97;
      --ink: #f8f4d8;
      --muted: #b8a8cc;
      --highlight: #c084fc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }
    h1, h2 { margin: 0; line-height: 1.15; }
    h1 { font-size: 30px; }
    h2 { font-size: 20px; }
    p { color: var(--muted); margin: 8px 0 0; }
    .notes {
      max-width: 720px;
      color: #d8c9ee;
      font-size: 13px;
    }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      margin-bottom: 22px;
    }
    .meta {
      color: var(--muted);
      text-align: right;
      font-size: 13px;
    }
    .panel, .scenario {
      background: linear-gradient(180deg, var(--panel), #171024);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 16px 34px rgba(0, 0, 0, .25);
    }
    .panel {
      padding: 16px;
      margin-bottom: 18px;
      overflow-x: auto;
    }
    .scenario {
      padding: 18px;
      margin: 18px 0;
    }
    .scenario-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 14px;
    }
    .status {
      border: 1px solid var(--border);
      background: var(--panel-soft);
      border-radius: 999px;
      padding: 6px 10px;
      color: var(--highlight);
      font-size: 13px;
      text-transform: uppercase;
    }
    .outcome-survived {
      border-color: rgba(82, 210, 115, .55);
      background: rgba(82, 210, 115, .12);
      color: #9ff0b2;
    }
    .outcome-critical, .outcome-needs-tuning {
      border-color: rgba(255, 170, 69, .55);
      background: rgba(255, 170, 69, .12);
      color: #ffd08a;
    }
    .outcome-dead {
      border-color: rgba(255, 92, 115, .55);
      background: rgba(255, 92, 115, .12);
      color: #ff9aaa;
    }
    .chart {
      display: block;
      width: 100%;
      height: auto;
      border-radius: 10px;
      overflow: hidden;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 10px 16px;
      margin: 12px 0 4px;
      color: var(--muted);
      font-size: 13px;
    }
    .legend span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .legend i {
      width: 12px;
      height: 12px;
      border-radius: 999px;
      display: inline-block;
    }
    .action-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
    .action-list span {
      border: 1px solid rgba(82, 210, 115, .45);
      background: rgba(82, 210, 115, .1);
      border-radius: 999px;
      color: #9ff0b2;
      font-size: 12px;
      padding: 4px 8px;
    }
    .action-note {
      font-size: 13px;
      margin-top: 12px;
    }
    .verdict {
      margin-top: 12px;
      border: 1px solid rgba(255, 255, 255, .08);
      background: rgba(0, 0, 0, .18);
      border-radius: 8px;
      padding: 10px 12px;
    }
    .verdict strong {
      display: block;
      color: var(--ink);
      font-size: 13px;
      margin-bottom: 6px;
    }
    .verdict ul {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      font-size: 13px;
    }
    .action-events {
      margin-top: 12px;
    }
    .table-scroll {
      overflow-x: auto;
      margin-top: 8px;
    }
    code {
      color: #f8f4d8;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 12px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .threshold-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 10px;
    }
    .summary-grid div {
      background: rgba(255, 255, 255, .045);
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      padding: 10px;
    }
    .threshold-grid div {
      background: rgba(255, 255, 255, .035);
      border: 1px solid rgba(255, 255, 255, .07);
      border-radius: 8px;
      padding: 8px 10px;
    }
    .summary-grid strong {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
    }
    .threshold-grid strong {
      display: block;
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
    }
    .summary-grid span {
      display: block;
      margin-top: 4px;
      font-size: 18px;
    }
    .threshold-grid span {
      display: block;
      margin-top: 3px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 780px;
    }
    th, td {
      border-bottom: 1px solid rgba(255, 255, 255, .1);
      padding: 9px 10px;
      text-align: left;
      white-space: nowrap;
    }
    th {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    .table-outcome {
      display: inline-block;
      border: 1px solid var(--border);
      border-radius: 999px;
      padding: 3px 8px;
      font-size: 12px;
      text-transform: uppercase;
    }
    details {
      margin-top: 12px;
      color: var(--muted);
    }
    summary { cursor: pointer; }
    pre {
      overflow-x: auto;
      background: rgba(0, 0, 0, .25);
      border-radius: 8px;
      padding: 12px;
      color: var(--ink);
    }
    @media (max-width: 720px) {
      .top { display: block; }
      .meta { text-align: left; margin-top: 10px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .threshold-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }
  </style>
</head>
<body>
  <main>
    <header class="top">
      <div>
        <h1>${escapeHtml(result.title)}</h1>
        <p>Static report generated from the current shared stat engine.</p>
      </div>
      <div class="meta">
        <div>Generated: ${escapeHtml(result.generatedAt)}</div>
        <div>Window: ${escapeHtml(result.config.hours)}h / step ${escapeHtml(result.config.stepMinutes)}m</div>
      </div>
    </header>
    <section class="panel">
      ${renderScenarioTable(result.scenarios)}
    </section>
    ${renderHealthComparison(result.scenarios)}
    ${result.scenarios.map(renderScenario).join("")}
    <section class="panel">
      <h2>Constants Snapshot</h2>
      <pre>${escapeHtml(JSON.stringify(result.constants, null, 2))}</pre>
    </section>
    ${
      result.constantOverrides
        ? `<section class="panel">
      <h2>Constant Overrides</h2>
      <pre>${escapeHtml(JSON.stringify(result.constantOverrides, null, 2))}</pre>
    </section>`
        : ""
    }
  </main>
</body>
</html>`;
}

function renderDistributionTable(title, rows, options = {}) {
  const maxCount = Math.max(...rows.map((row) => Number(row.count)), 1);
  const minCount = rows.length
    ? Math.min(...rows.map((row) => Number(row.count)))
    : 0;
  const headingTag = options.headingTag ?? "h2";
  const content = `
    <${headingTag}>${escapeHtml(title)}</${headingTag}>
    <div class="bar-range">
      <span>Min: ${escapeHtml(minCount)}</span>
      <span>Max: ${escapeHtml(maxCount)}</span>
    </div>
    <div class="bar-chart" aria-label="${escapeAttr(title)} chart">
      ${renderBarGrid()}
      ${rows.map((row) => {
        const height = Math.max((Number(row.count) / maxCount) * 100, 2);
        return `
          <div class="bar-row">
            <div class="bar-value">${escapeHtml(row.count)} / ${escapeHtml(row.percentage)}%</div>
            <div class="bar-track">
              <div class="bar-fill" style="height:${height.toFixed(2)}%"></div>
            </div>
            <div class="bar-label">${escapeHtml(row.id)}</div>
          </div>
        `;
      }).join("")}
    </div>
    <table>
      <thead>
        <tr>
          <th>Value</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => `
          <tr>
            <td>${escapeHtml(row.id)}</td>
            <td>${escapeHtml(row.count)}</td>
            <td>${escapeHtml(row.percentage)}%</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;

  if (options.wrap === false) {
    return `<div class="distribution-block">${content}</div>`;
  }

  return `
    <section class="panel">
      ${content}
    </section>
  `;
}

function renderGenomeHtml(result) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(result.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0614;
      --panel: #201535;
      --border: #5f3e97;
      --ink: #f8f4d8;
      --muted: #b8a8cc;
      --highlight: #c084fc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }
    h1, h2 { margin: 0; line-height: 1.15; }
    h1 { font-size: 30px; }
    h2 { font-size: 20px; }
    p { color: var(--muted); margin: 8px 0 0; }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      margin-bottom: 22px;
    }
    .meta {
      color: var(--muted);
      text-align: right;
      font-size: 13px;
    }
    .panel {
      background: linear-gradient(180deg, var(--panel), #171024);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 16px 34px rgba(0, 0, 0, .25);
      padding: 16px;
      margin-bottom: 18px;
      overflow-x: auto;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .summary-grid div {
      background: rgba(255, 255, 255, .045);
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      padding: 10px;
    }
    .summary-grid strong {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
    }
    .summary-grid span {
      display: block;
      margin-top: 4px;
      font-size: 18px;
    }
    .bar-range {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
      color: var(--muted);
      font-size: 12px;
    }
    .bar-range span {
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 999px;
      background: rgba(255, 255, 255, .045);
      padding: 3px 8px;
    }
    .bar-chart {
      display: flex;
      align-items: end;
      gap: 12px;
      position: relative;
      margin-top: 14px;
      margin-bottom: 16px;
      min-width: 760px;
      min-height: 250px;
      padding: 10px 0 2px 34px;
    }
    .bar-grid {
      position: absolute;
      left: 0;
      right: 0;
      top: 43px;
      height: 180px;
      pointer-events: none;
      z-index: 0;
    }
    .bar-grid-line {
      position: absolute;
      left: 0;
      right: 0;
      border-top: 1px solid rgba(184, 168, 204, .2);
    }
    .bar-grid-line:nth-child(5n + 1) {
      border-top-color: rgba(184, 168, 204, .36);
    }
    .bar-grid-line span {
      position: absolute;
      left: 0;
      top: -7px;
      width: 26px;
      color: var(--muted);
      font-size: 10px;
      line-height: 1;
      text-align: right;
    }
    .bar-row {
      display: grid;
      grid-template-rows: auto 180px auto;
      align-items: end;
      justify-items: center;
      gap: 7px;
      min-width: 56px;
      flex: 1 0 56px;
      position: relative;
      z-index: 1;
    }
    .bar-label {
      color: var(--ink);
      font-size: 12px;
      line-height: 1.15;
      max-width: 78px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .bar-track {
      display: flex;
      align-items: end;
      width: 100%;
      max-width: 72px;
      height: 180px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      background: rgba(255, 255, 255, .05);
    }
    .bar-fill {
      width: 100%;
      border-radius: 7px 7px 0 0;
      background: linear-gradient(180deg, #5cc8ff, #c084fc);
    }
    .bar-value {
      color: var(--muted);
      font-size: 11px;
      line-height: 1.15;
      min-height: 26px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }
    th, td {
      border-bottom: 1px solid rgba(255, 255, 255, .1);
      padding: 9px 10px;
      text-align: left;
      white-space: nowrap;
    }
    th {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    pre {
      overflow-x: auto;
      background: rgba(0, 0, 0, .25);
      border-radius: 8px;
      padding: 12px;
      color: var(--ink);
    }
    @media (max-width: 720px) {
      .top { display: block; }
      .meta { text-align: left; margin-top: 10px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .bar-chart {
        min-width: 0;
        overflow-x: auto;
      }
      .bar-row {
        flex-basis: 54px;
      }
    }
  </style>
</head>
<body>
  <main>
    <header class="top">
      <div>
        <h1>${escapeHtml(result.title)}</h1>
        <p>Static genome distribution report generated from shared GenomeGenerator.</p>
      </div>
      <div class="meta">
        <div>Generated: ${escapeHtml(result.generatedAt)}</div>
        <div>Sample: ${escapeHtml(result.config.sampleSize)} / seed ${escapeHtml(result.config.seed)}</div>
      </div>
    </header>
    <section class="panel">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div><strong>Total generated</strong><span>${escapeHtml(result.summary.totalGenerated)}</span></div>
        <div><strong>Average score</strong><span>${escapeHtml(result.summary.averageScore)}</span></div>
        <div><strong>Holy grail count</strong><span>${escapeHtml(result.summary.holyGrailCount)}</span></div>
        <div><strong>Holy grail %</strong><span>${escapeHtml(result.summary.holyGrailPercentage)}%</span></div>
      </div>
    </section>
    ${renderDistributionTable("Rarity Distribution", result.distributions.rarity)}
    ${renderDistributionTable("Element Distribution", result.distributions.element)}
    ${renderDistributionTable("Gender Distribution", result.distributions.gender)}
    ${renderDistributionTable("Trait Distribution", result.distributions.traits)}
    ${renderDistributionTable("Negative Trait Count Distribution", result.distributions.negativeTraitCounts)}
    <section class="panel">
      <h2>Top Genomes</h2>
      <table>
        <thead>
          <tr>
            <th>Score</th>
            <th>Rarity</th>
            <th>Element</th>
            <th>Gender</th>
            <th>Traits</th>
            <th>Hash</th>
          </tr>
        </thead>
        <tbody>
          ${result.topGenomes.map(({ genome, score }) => `
            <tr>
              <td>${escapeHtml(score.totalScore)}</td>
              <td>${escapeHtml(genome.rarity)}</td>
              <td>${escapeHtml(genome.element)}</td>
              <td>${escapeHtml(genome.gender)}</td>
              <td>${escapeHtml(genome.traits.join(", "))}</td>
              <td>${escapeHtml(genome.genome_hash)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
    <section class="panel">
      <h2>Raw Result</h2>
      <pre>${escapeHtml(JSON.stringify(result, null, 2))}</pre>
    </section>
  </main>
</body>
</html>`;
}

function renderTopItemsTable(items) {
  return `
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th>Rarity</th>
          <th>Occurrences</th>
          <th>Drop Chance</th>
          <th>Avg / Chest</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => `
          <tr>
            <td>${escapeHtml(item.itemId)}</td>
            <td>${escapeHtml(item.type)}</td>
            <td>${escapeHtml(item.rarity)}</td>
            <td>${escapeHtml(item.occurrences)}</td>
            <td>${escapeHtml(item.dropChance)}%</td>
            <td>${escapeHtml(item.averagePerChest)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderItemsCatalogTable(items) {
  return `
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th>Rarity</th>
          <th>Hunger</th>
          <th>Health</th>
          <th>Clean</th>
          <th>Happy</th>
          <th>Energy</th>
          <th>Cooldown</th>
          <th>Max / Day</th>
          <th>Stack</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => `
          <tr>
            <td>${escapeHtml(item.name)} <code>${escapeHtml(item.itemId)}</code></td>
            <td>${escapeHtml(item.itemType)}</td>
            <td>${escapeHtml(item.rarity)}</td>
            <td>${escapeHtml(item.effects.hunger ?? 0)}</td>
            <td>${escapeHtml(item.effects.health ?? 0)}</td>
            <td>${escapeHtml(item.effects.cleanliness ?? 0)}</td>
            <td>${escapeHtml(item.effects.happiness ?? 0)}</td>
            <td>${escapeHtml(item.effects.energy ?? 0)}</td>
            <td>${escapeHtml(item.cooldownMinutes ?? "-")}</td>
            <td>${escapeHtml(item.maxPerDay ?? "-")}</td>
            <td>${escapeHtml(item.isStackable ? (item.maxStack ?? "yes") : "no")}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function renderEffectBars(title, rows, mode) {
  if (rows.length === 0) {
    return "";
  }

  const maxValue = Math.max(...rows.map((row) => Math.abs(Number(row.value))), 1);
  const minValue = Math.min(...rows.map((row) => Number(row.value)));
  const rawMaxValue = Math.max(...rows.map((row) => Number(row.value)));

  return `
    <section class="panel">
      <h2>${escapeHtml(title)}</h2>
      <div class="bar-range">
        <span>Min: ${escapeHtml(minValue)}</span>
        <span>Max: ${escapeHtml(rawMaxValue)}</span>
      </div>
      <div class="bar-chart effect-chart ${mode === "negative" ? "negative-chart" : ""}" aria-label="${escapeAttr(title)} chart">
        ${renderBarGrid()}
        ${rows.map((row) => {
          const height = Math.max((Math.abs(Number(row.value)) / maxValue) * 100, 2);
          return `
            <div class="bar-row">
              <div class="bar-value">${escapeHtml(row.value)}</div>
              <div class="bar-track">
                <div class="bar-fill" style="height:${height.toFixed(2)}%"></div>
              </div>
              <div class="bar-label">${escapeHtml(row.itemId)}</div>
            </div>
          `;
        }).join("")}
      </div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Type</th>
            <th>Rarity</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((row) => `
            <tr>
              <td>${escapeHtml(row.name)} <code>${escapeHtml(row.itemId)}</code></td>
              <td>${escapeHtml(row.itemType)}</td>
              <td>${escapeHtml(row.rarity)}</td>
              <td>${escapeHtml(row.value)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderItemsHtml(result) {
  const statSections = Object.entries(result.effectStats)
    .map(([stat, effect]) => `
      ${renderEffectBars(`${stat} Positive Effects`, effect.positive, "positive")}
      ${renderEffectBars(`${stat} Negative Effects`, effect.negative, "negative")}
    `)
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(result.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0614;
      --panel: #201535;
      --border: #5f3e97;
      --ink: #f8f4d8;
      --muted: #b8a8cc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }
    h1, h2 { margin: 0; line-height: 1.15; }
    h1 { font-size: 30px; }
    h2 { font-size: 20px; }
    p { color: var(--muted); margin: 8px 0 0; }
    code { color: var(--muted); font-size: 11px; }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      margin-bottom: 22px;
    }
    .meta {
      color: var(--muted);
      text-align: right;
      font-size: 13px;
    }
    .panel {
      background: linear-gradient(180deg, var(--panel), #171024);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 16px 34px rgba(0, 0, 0, .25);
      padding: 16px;
      margin-bottom: 18px;
      overflow-x: auto;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .summary-grid div {
      background: rgba(255, 255, 255, .045);
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      padding: 10px;
    }
    .summary-grid strong {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
    }
    .summary-grid span {
      display: block;
      margin-top: 4px;
      font-size: 18px;
    }
    .bar-range {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
      color: var(--muted);
      font-size: 12px;
    }
    .bar-range span {
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 999px;
      background: rgba(255, 255, 255, .045);
      padding: 3px 8px;
    }
    .bar-chart {
      display: flex;
      align-items: end;
      gap: 12px;
      position: relative;
      margin-top: 14px;
      margin-bottom: 16px;
      min-width: 760px;
      min-height: 250px;
      padding: 10px 0 2px 34px;
    }
    .bar-grid {
      position: absolute;
      left: 0;
      right: 0;
      top: 43px;
      height: 180px;
      pointer-events: none;
      z-index: 0;
    }
    .bar-grid-line {
      position: absolute;
      left: 0;
      right: 0;
      border-top: 1px solid rgba(184, 168, 204, .2);
    }
    .bar-grid-line:nth-child(5n + 1) {
      border-top-color: rgba(184, 168, 204, .36);
    }
    .bar-grid-line span {
      position: absolute;
      left: 0;
      top: -7px;
      width: 26px;
      color: var(--muted);
      font-size: 10px;
      line-height: 1;
      text-align: right;
    }
    .bar-row {
      display: grid;
      grid-template-rows: auto 180px auto;
      align-items: end;
      justify-items: center;
      gap: 7px;
      min-width: 56px;
      flex: 1 0 56px;
      position: relative;
      z-index: 1;
    }
    .bar-label {
      color: var(--ink);
      font-size: 12px;
      line-height: 1.15;
      max-width: 78px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .bar-track {
      display: flex;
      align-items: end;
      width: 100%;
      max-width: 72px;
      height: 180px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      background: rgba(255, 255, 255, .05);
    }
    .bar-fill {
      width: 100%;
      border-radius: 7px 7px 0 0;
      background: linear-gradient(180deg, #5cc8ff, #c084fc);
    }
    .negative-chart .bar-fill {
      background: linear-gradient(180deg, #ffaa45, #ff5c73);
    }
    .bar-value {
      color: var(--muted);
      font-size: 11px;
      line-height: 1.15;
      min-height: 26px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 860px;
    }
    th, td {
      border-bottom: 1px solid rgba(255, 255, 255, .1);
      padding: 9px 10px;
      text-align: left;
      white-space: nowrap;
    }
    th {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    @media (max-width: 720px) {
      .top { display: block; }
      .meta { text-align: left; margin-top: 10px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .bar-chart {
        min-width: 0;
        overflow-x: auto;
      }
      .bar-row { flex-basis: 54px; }
    }
  </style>
</head>
<body>
  <main>
    <header class="top">
      <div>
        <h1>${escapeHtml(result.title)}</h1>
        <p>Static item catalog report generated from shared item constants.</p>
      </div>
      <div class="meta">
        <div>Generated: ${escapeHtml(result.generatedAt)}</div>
        <div>${escapeHtml(result.summary.totalItems)} items</div>
      </div>
    </header>
    <section class="panel">
      <h2>Summary</h2>
      <div class="summary-grid">
        <div><strong>Total items</strong><span>${escapeHtml(result.summary.totalItems)}</span></div>
        <div><strong>Stackable</strong><span>${escapeHtml(result.summary.stackableItems)}</span></div>
        <div><strong>Cooldown</strong><span>${escapeHtml(result.summary.cooldownItems)}</span></div>
        <div><strong>Limited / day</strong><span>${escapeHtml(result.summary.limitedPerDayItems)}</span></div>
      </div>
    </section>
    ${renderDistributionTable("Item Type Distribution", result.distributions.byType)}
    ${renderDistributionTable("Item Rarity Distribution", result.distributions.byRarity)}
    <section class="panel">
      <h2>Top Care Items</h2>
      ${renderItemsCatalogTable(result.topCareItems)}
    </section>
    ${statSections}
    <section class="panel">
      <h2>Full Item Catalog</h2>
      ${renderItemsCatalogTable(result.items)}
    </section>
  </main>
</body>
</html>`;
}

function renderChestsHtml(result) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(result.title)}</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0a0614;
      --panel: #201535;
      --border: #5f3e97;
      --ink: #f8f4d8;
      --muted: #b8a8cc;
      --highlight: #c084fc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    main {
      width: min(1180px, calc(100vw - 32px));
      margin: 0 auto;
      padding: 28px 0 48px;
    }
    h1, h2, h3 { margin: 0; line-height: 1.15; }
    h1 { font-size: 30px; }
    h2 { font-size: 20px; }
    h3 { font-size: 16px; margin-top: 16px; }
    p { color: var(--muted); margin: 8px 0 0; }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      align-items: flex-end;
      margin-bottom: 22px;
    }
    .meta {
      color: var(--muted);
      text-align: right;
      font-size: 13px;
    }
    .panel {
      background: linear-gradient(180deg, var(--panel), #171024);
      border: 1px solid var(--border);
      border-radius: 10px;
      box-shadow: 0 16px 34px rgba(0, 0, 0, .25);
      padding: 16px;
      margin-bottom: 18px;
      overflow-x: auto;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
      margin-top: 14px;
    }
    .summary-grid div {
      background: rgba(255, 255, 255, .045);
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      padding: 10px;
    }
    .summary-grid strong {
      display: block;
      color: var(--muted);
      font-size: 12px;
      font-weight: 600;
    }
    .summary-grid span {
      display: block;
      margin-top: 4px;
      font-size: 18px;
    }
    .bar-range {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
      color: var(--muted);
      font-size: 12px;
    }
    .bar-range span {
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 999px;
      background: rgba(255, 255, 255, .045);
      padding: 3px 8px;
    }
    .bar-chart {
      display: flex;
      align-items: end;
      gap: 12px;
      position: relative;
      margin-top: 14px;
      margin-bottom: 16px;
      min-width: 760px;
      min-height: 250px;
      padding: 10px 0 2px 34px;
    }
    .bar-grid {
      position: absolute;
      left: 0;
      right: 0;
      top: 43px;
      height: 180px;
      pointer-events: none;
      z-index: 0;
    }
    .bar-grid-line {
      position: absolute;
      left: 0;
      right: 0;
      border-top: 1px solid rgba(184, 168, 204, .2);
    }
    .bar-grid-line:nth-child(5n + 1) {
      border-top-color: rgba(184, 168, 204, .36);
    }
    .bar-grid-line span {
      position: absolute;
      left: 0;
      top: -7px;
      width: 26px;
      color: var(--muted);
      font-size: 10px;
      line-height: 1;
      text-align: right;
    }
    .bar-row {
      display: grid;
      grid-template-rows: auto 180px auto;
      align-items: end;
      justify-items: center;
      gap: 7px;
      min-width: 56px;
      flex: 1 0 56px;
      position: relative;
      z-index: 1;
    }
    .bar-label {
      color: var(--ink);
      font-size: 12px;
      line-height: 1.15;
      max-width: 78px;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      white-space: normal;
      overflow-wrap: anywhere;
    }
    .bar-track {
      display: flex;
      align-items: end;
      width: 100%;
      max-width: 72px;
      height: 180px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, .08);
      border-radius: 8px;
      background: rgba(255, 255, 255, .05);
    }
    .bar-fill {
      width: 100%;
      border-radius: 7px 7px 0 0;
      background: linear-gradient(180deg, #5cc8ff, #c084fc);
    }
    .bar-value {
      color: var(--muted);
      font-size: 11px;
      line-height: 1.15;
      min-height: 26px;
      text-align: center;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }
    th, td {
      border-bottom: 1px solid rgba(255, 255, 255, .1);
      padding: 9px 10px;
      text-align: left;
      white-space: nowrap;
    }
    th {
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .03em;
    }
    @media (max-width: 720px) {
      .top { display: block; }
      .meta { text-align: left; margin-top: 10px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .bar-chart {
        min-width: 0;
        overflow-x: auto;
      }
      .bar-row { flex-basis: 54px; }
    }
  </style>
</head>
<body>
  <main>
    <header class="top">
      <div>
        <h1>${escapeHtml(result.title)}</h1>
        <p>Static chest drop and opening report generated from shared ChestGenerator.</p>
      </div>
      <div class="meta">
        <div>Generated: ${escapeHtml(result.generatedAt)}</div>
        <div>Drop sample: ${escapeHtml(result.config.randomChestSampleSize)} / open sample: ${escapeHtml(result.config.openPerChestType)}</div>
      </div>
    </header>
    ${renderDistributionTable("Random Chest Drop Distribution", result.randomChestDrops.distribution)}
    ${result.chests.map((chest) => `
      <section class="panel">
        <h2>${escapeHtml(chest.chestType)} Chest</h2>
        <div class="summary-grid">
          <div><strong>Opened</strong><span>${escapeHtml(chest.summary.opened)}</span></div>
          <div><strong>Average value</strong><span>${escapeHtml(chest.summary.averageValue)}</span></div>
          <div><strong>Average items</strong><span>${escapeHtml(chest.summary.averageItemsPerChest)}</span></div>
          <div><strong>Egg chance</strong><span>${escapeHtml(chest.summary.eggChance)}%</span></div>
        </div>
        ${renderDistributionTable(`${chest.chestType} Item Type Distribution`, chest.itemTypeDistribution, { wrap: false, headingTag: "h3" })}
        ${renderDistributionTable(`${chest.chestType} Item Rarity Distribution`, chest.itemRarityDistribution, { wrap: false, headingTag: "h3" })}
        <h3>Top Items</h3>
        ${renderTopItemsTable(chest.topItems)}
      </section>
    `).join("")}
  </main>
</body>
</html>`;
}

export function renderHtml(result) {
  if (result.id === "care-balance") {
    return renderStatsHtml(result);
  }

  if (result.id === "items") {
    return renderItemsHtml(result);
  }

  if (result.id === "chests") {
    return renderChestsHtml(result);
  }

  if (result.id === "genome") {
    return renderGenomeHtml(result);
  }

  return renderStatsHtml(result);
}

export function renderDashboardHtml(results, context = {}) {
  const pages = results.map((result) => ({
    id: result.id,
    title: result.title,
    navTitle: result.id === "stats" ? "Stats" : result.id === "genome" ? "Genome" : result.id === "chests" ? "Chests" : result.id === "items" ? "Items" : result.id === "care-balance" ? "Care" : result.title,
    html: renderHtml(result, context),
  }));
  const firstPage = pages[0]?.id ?? "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PixeGotchi Sim Lab</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #090612;
      --nav: #181024;
      --panel: #211637;
      --border: #5f3e97;
      --ink: #f8f4d8;
      --muted: #b8a8cc;
      --active: #c084fc;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--bg);
      color: var(--ink);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .app {
      min-height: 100vh;
    }
    nav {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      grid-template-areas: "brand tabs meta";
      align-items: center;
      gap: 18px;
      border-bottom: 1px solid var(--border);
      background: var(--nav);
      padding: 14px 18px;
    }
    h1 {
      grid-area: brand;
      margin: 0 0 4px;
      font-size: 19px;
      line-height: 1.15;
    }
    .meta {
      grid-area: meta;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.4;
      text-align: right;
    }
    .tabs {
      grid-area: tabs;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
    }
    button {
      border: 1px solid rgba(255, 255, 255, .1);
      border-radius: 8px;
      background: rgba(255, 255, 255, .04);
      color: var(--ink);
      cursor: pointer;
      font: inherit;
      padding: 8px 11px;
      text-align: center;
      white-space: nowrap;
    }
    button[aria-selected="true"] {
      border-color: var(--active);
      background: rgba(192, 132, 252, .16);
      color: #fff;
    }
    main {
      min-width: 0;
      min-height: 100vh;
      background: var(--bg);
    }
    .page {
      display: none;
      width: 100%;
      height: calc(100vh - 78px);
      border: 0;
      background: var(--bg);
    }
    .page[data-active="true"] {
      display: block;
    }
    @media (max-width: 820px) {
      .app {
        display: block;
      }
      nav {
        display: block;
      }
      .meta {
        text-align: left;
        margin-top: 10px;
      }
      .page {
        height: calc(100vh - 164px);
      }
      .tabs {
        justify-content: center;
        margin-top: 12px;
      }
    }
  </style>
</head>
<body>
  <div class="app">
    <nav>
      <h1>PixeGotchi Sim Lab</h1>
      <div class="meta">
        <div>Generated: ${escapeHtml(context.generatedAt ?? new Date().toISOString())}</div>
        <div>${escapeHtml(pages.length)} modules</div>
      </div>
      <div class="tabs" role="tablist" aria-label="Simulation modules">
        ${pages.map((page) => `
          <button type="button" role="tab" aria-selected="${page.id === firstPage}" data-target="${escapeHtml(page.id)}">
            ${escapeHtml(page.navTitle)}
          </button>
        `).join("")}
      </div>
    </nav>
    <main>
      ${pages.map((page) => `
        <iframe
          class="page"
          title="${escapeAttr(page.title)}"
          data-page="${escapeAttr(page.id)}"
          data-active="${page.id === firstPage}"
          srcdoc="${escapeAttr(page.html)}"
        ></iframe>
      `).join("")}
    </main>
  </div>
  <script>
    const buttons = Array.from(document.querySelectorAll("button[data-target]"));
    const pages = Array.from(document.querySelectorAll("iframe[data-page]"));

    function showPage(id) {
      for (const button of buttons) {
        button.setAttribute("aria-selected", String(button.dataset.target === id));
      }
      for (const page of pages) {
        page.dataset.active = String(page.dataset.page === id);
      }
      history.replaceState(null, "", "#" + id);
    }

    for (const button of buttons) {
      button.addEventListener("click", () => showPage(button.dataset.target));
    }

    const initial = location.hash.slice(1);
    if (initial && pages.some((page) => page.dataset.page === initial)) {
      showPage(initial);
    }
  </script>
</body>
</html>`;
}
