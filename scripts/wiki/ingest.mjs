import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  appendText,
  compiledIndexPath,
  indexDir,
  logPath,
  readText,
  summarizeMarkdown,
  vaultRoot,
  writeText,
} from "./common.mjs";

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "note";
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getZoneParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Kiev",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return values;
}

function getLocalDateStamp(date = new Date()) {
  const parts = getZoneParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getLocalTimestamp(date = new Date()) {
  const parts = getZoneParts(date);
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}

function parseArgs(argv) {
  const args = { sourcePath: "", title: "" };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--title") {
      args.title = argv[index + 1] ?? "";
      index += 1;
      continue;
    }

    if (!args.sourcePath) {
      args.sourcePath = token;
    }
  }

  return args;
}

const { sourcePath: rawSourcePath, title: explicitTitle } = parseArgs(process.argv.slice(2));

if (!rawSourcePath) {
  console.error("Usage: npm run wiki:ingest -- <source.md> [--title \"Title\"]");
  process.exit(1);
}

const sourcePath = path.resolve(process.cwd(), rawSourcePath);
const sourceStat = await fs.stat(sourcePath).catch(() => null);

if (!sourceStat || !sourceStat.isFile()) {
  console.error(`Source file not found: ${rawSourcePath}`);
  process.exit(1);
}

const sourceContent = await readText(sourcePath);
const extractedTitle = explicitTitle || sourceContent.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.basename(sourcePath, path.extname(sourcePath));
const summary = summarizeMarkdown(sourceContent) || "No summary extracted.";
const now = new Date();
const timestamp = getLocalTimestamp(now);
const datePrefix = getLocalDateStamp(now);
const outputName = `${datePrefix}-${slugify(extractedTitle)}.md`;
const outputPath = path.join(vaultRoot, "10_Research", outputName);
const sourceRelative = path.relative(process.cwd(), sourcePath).split(path.sep).join("/");

const noteContent = [
  `# ${extractedTitle}`,
  "",
  `Source: \`${sourceRelative}\``,
  `Ingested: ${timestamp}`,
  "",
  "## Summary",
  "",
  summary,
  "",
  "## Notes",
  "",
  "- Add cross-links to related vault pages.",
  "- Expand this page as the source becomes part of the working knowledge base.",
  "",
].join("\n");

await writeText(outputPath, `${noteContent}\n`);

const outputRelative = path.relative(vaultRoot, outputPath).split(path.sep).join("/");
const logEntry = [
  `## [${timestamp}] ingest ${extractedTitle}`,
  "",
  `- source: \`${sourceRelative}\``,
  `- note: [[${outputRelative.replace(/\.md$/i, "")}]]`,
  "",
].join("\n");

if (!(await fs.access(indexDir).then(() => true).catch(() => false))) {
  await fs.mkdir(indexDir, { recursive: true });
}

if (!(await fs.access(logPath).then(() => true).catch(() => false))) {
  await writeText(logPath, "# Vault Log\n\n");
}

await appendText(logPath, `${logEntry}\n`);

const compileResult = spawnSync(process.execPath, [path.join("scripts", "wiki", "compile.mjs")], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (compileResult.status !== 0) {
  process.exit(compileResult.status ?? 1);
}

const lintResult = spawnSync(process.execPath, [path.join("scripts", "wiki", "lint.mjs")], {
  cwd: process.cwd(),
  stdio: "inherit",
});

if (lintResult.status !== 0) {
  process.exit(lintResult.status ?? 1);
}

console.log(`Ingested ${sourceRelative} -> ${path.relative(process.cwd(), outputPath)}`);
console.log(`Index: ${path.relative(process.cwd(), compiledIndexPath)}`);
