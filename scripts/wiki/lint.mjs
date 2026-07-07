import path from "node:path";
import { pathExists, readText, vaultRoot, walkMarkdownFiles } from "./common.mjs";

const files = await walkMarkdownFiles(vaultRoot);
const issues = [];
const inbound = new Map();
const fileSet = new Set(files.map((filePath) => path.relative(vaultRoot, filePath).split(path.sep).join("/")));

function registerInbound(target) {
  const current = inbound.get(target) ?? 0;
  inbound.set(target, current + 1);
}

for (const filePath of files) {
  const relative = path.relative(vaultRoot, filePath).split(path.sep).join("/");
  const content = await readText(filePath);

  const wikiLinks = Array.from(content.matchAll(/\[\[([^\]]+)\]\]/g));
  for (const match of wikiLinks) {
    const rawTarget = match[1].split("|")[0].split("#")[0].trim();
    if (!rawTarget) {
      continue;
    }

    const normalized = rawTarget.endsWith(".md") ? rawTarget : `${rawTarget}.md`;
    const target = normalized.split("/").join(path.sep);
    const candidateRelative = path.relative(vaultRoot, path.resolve(path.dirname(filePath), target)).split(path.sep).join("/");
    const directRelative = normalized.split(path.sep).join("/");
    const resolved = fileSet.has(directRelative) ? directRelative : candidateRelative;

    if (!fileSet.has(resolved)) {
      issues.push(`${relative}: broken wiki link -> [[${rawTarget}]]`);
      continue;
    }

    registerInbound(resolved);
  }

  const markdownLinks = Array.from(content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g));
  for (const match of markdownLinks) {
    const target = match[1].trim();
    if (!target || target.startsWith("http://") || target.startsWith("https://") || target.startsWith("file://")) {
      continue;
    }

    const cleaned = target.split("#")[0].split("?")[0];
    const absolute = path.resolve(path.dirname(filePath), cleaned);
    const relativeTarget = path.relative(vaultRoot, absolute).split(path.sep).join("/");

    if (cleaned.startsWith("/") && !(await pathExists(cleaned))) {
      issues.push(`${relative}: broken absolute link -> (${target})`);
      continue;
    }

    if (cleaned.startsWith("Vault/")) {
      const vaultRelative = cleaned.slice("Vault/".length);
      if (!fileSet.has(vaultRelative)) {
        issues.push(`${relative}: broken vault link -> (${target})`);
      }
      continue;
    }

    if (cleaned.startsWith("docs/") || cleaned.startsWith(".docs/") || cleaned.startsWith("packages/") || cleaned.startsWith("scripts/")) {
      continue;
    }

    if (!fileSet.has(relativeTarget) && !cleaned.startsWith("#")) {
      issues.push(`${relative}: broken relative link -> (${target})`);
    }
  }
}

const orphanThreshold = new Set([
  "README.md",
  "00_Index/Home.md",
  "00_Index/Index.md",
  "00_Index/Log.md",
  "00_Index/Agent Operating Manual.md",
  "08_Decisions/Decision Log.md",
  "10_Research/Inbox.md",
  "99_Templates/Note Template.md",
  "99_Templates/Decision Record Template.md",
  "99_Templates/Runbook Template.md",
]);

for (const filePath of files) {
  const relative = path.relative(vaultRoot, filePath).split(path.sep).join("/");
  if (orphanThreshold.has(relative)) {
    continue;
  }

  const count = inbound.get(relative) ?? 0;
  if (count === 0) {
    issues.push(`${relative}: orphan page`);
  }
}

if (issues.length > 0) {
  console.error("Wiki lint failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exitCode = 1;
} else {
  console.log("Wiki lint passed.");
}
