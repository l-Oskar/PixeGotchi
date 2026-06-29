import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
    fileParallelism: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",
      include: ["src/**/*.ts", "../shared/src/**/*.ts"],
      exclude: [
        "src/generated/**",
        "src/test/**",
        "src/server.ts",
        "src/database/seed*.ts",
        "src/utils/example_open_chest.ts",
      ],
    },
  },
});
