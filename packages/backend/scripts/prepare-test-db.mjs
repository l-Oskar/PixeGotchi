import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { config as loadEnv } from "dotenv";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(scriptDirectory, "..");
const testEnvPath = path.join(backendDirectory, ".env.test");
const exampleEnvPath = path.join(backendDirectory, ".env.test.example");

if (existsSync(testEnvPath)) {
  loadEnv({ path: testEnvPath });
}
loadEnv({ path: exampleEnvPath });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Test DATABASE_URL is missing. Create packages/backend/.env.test or provide DATABASE_URL.",
  );
}

let parsedDatabaseUrl;
try {
  parsedDatabaseUrl = new URL(databaseUrl);
} catch {
  throw new Error("Test DATABASE_URL is not a valid URL.");
}

const databaseName = decodeURIComponent(
  parsedDatabaseUrl.pathname.replace(/^\/+/, ""),
);
if (!databaseName || !/test/i.test(databaseName)) {
  throw new Error(
    `Refusing to prepare database "${databaseName || "unknown"}". Its name must contain "test".`,
  );
}

const prismaExecutable = path.resolve(
  scriptDirectory,
  "../../../node_modules/.bin",
  process.platform === "win32" ? "prisma.cmd" : "prisma",
);
if (!existsSync(prismaExecutable)) {
  throw new Error(
    `Prisma executable not found at ${prismaExecutable}. Run npm install first.`,
  );
}

const runPrisma = (args) => {
  const result = spawnSync(prismaExecutable, args, {
    cwd: backendDirectory,
    env: {
      ...process.env,
      NODE_ENV: "test",
      DATABASE_URL: databaseUrl,
    },
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

console.log(
  `Preparing test database "${databaseName}" on ${parsedDatabaseUrl.hostname}...`,
);
runPrisma(["db", "push"]);
runPrisma(["generate"]);
