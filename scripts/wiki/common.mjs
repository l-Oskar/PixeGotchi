import fs from "node:fs/promises";
import path from "node:path";

export const repoRoot = process.cwd();
export const vaultRoot = path.join(repoRoot, "Vault");
export const indexDir = path.join(vaultRoot, "00_Index");
export const logPath = path.join(indexDir, "Log.md");
export const compiledIndexPath = path.join(indexDir, "Index.md");

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

export async function writeText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

export async function appendText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.appendFile(filePath, content, "utf8");
}

export async function walkMarkdownFiles(rootDir) {
  const entries = [];

  async function visit(dirPath) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    items.sort((left, right) => left.name.localeCompare(right.name));

    for (const item of items) {
      if (item.name === ".obsidian" || item.name === "_attachments") {
        continue;
      }

      const itemPath = path.join(dirPath, item.name);
      if (item.isDirectory()) {
        await visit(itemPath);
        continue;
      }

      if (item.isFile() && item.name.toLowerCase().endsWith(".md")) {
        entries.push(itemPath);
      }
    }
  }

  await visit(rootDir);
  return entries;
}

export function toVaultLink(filePath) {
  const relative = path.relative(vaultRoot, filePath).split(path.sep).join("/");
  const withoutExtension = relative.replace(/\.md$/i, "");
  return `[[${withoutExtension}]]`;
}

export function summarizeMarkdown(content) {
  const lines = content.split(/\r?\n/);
  let sawTitle = false;
  let inCodeFence = false;
  const paragraph = [];
  let inFrontmatter = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === "---" && !sawTitle && paragraph.length === 0) {
      inFrontmatter = !inFrontmatter;
      continue;
    }

    if (inFrontmatter) {
      continue;
    }

    if (trimmedLine.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    if (!sawTitle) {
      if (line.match(/^#\s+/)) {
        sawTitle = true;
      }
      continue;
    }

    if (!trimmedLine) {
      if (paragraph.length > 0) {
        break;
      }
      continue;
    }

    if (
      trimmedLine.startsWith("#") ||
      trimmedLine.startsWith("- ") ||
      trimmedLine.startsWith("* ") ||
      trimmedLine.startsWith("+ ") ||
      /^\d+\.\s/.test(trimmedLine) ||
      trimmedLine.startsWith(">") ||
      trimmedLine.startsWith("![")
    ) {
      if (paragraph.length > 0) {
        break;
      }
      continue;
    }

    paragraph.push(trimmedLine);
  }

  const trimmed = paragraph.join(" ").replace(/\s+/g, " ").trim();
  return trimmed.length > 180 ? `${trimmed.slice(0, 177)}...` : trimmed;
}
