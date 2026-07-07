import path from "node:path";
import { appendText, compiledIndexPath, logPath, pathExists, readText, writeText } from "./common.mjs";

const note = process.argv.slice(2).join(" ").trim();
const timestamp = new Date().toISOString();
const entryNote = note || "session update";

const header = `## [${timestamp}] ${entryNote}`;
const body = [
  header,
  "",
  "- captured by `npm run wiki:log`",
  "- update the relevant wiki pages after the session",
  "",
].join("\n");

if (!(await pathExists(logPath))) {
  await writeText(
    logPath,
    [
      "# Vault Log",
      "",
      "Append-only record of knowledge-base updates and notable sessions.",
      "",
      body,
    ].join("\n"),
  );
} else {
  const existing = await readText(logPath);
  const normalized = existing.endsWith("\n") ? existing : `${existing}\n`;
  await appendText(logPath, `\n${body}`);
  if (!normalized.includes("# Vault Log")) {
    await writeText(logPath, `# Vault Log\n\n${normalized}${body}`);
  }
}

console.log(`Appended ${path.relative(process.cwd(), logPath)}`);
console.log(`Index stays at ${path.relative(process.cwd(), compiledIndexPath)}`);
