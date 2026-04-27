import { buildApp } from "./app";
import { config } from "@/config/env";

async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: config.port,
      host: "0.0.0.0",
    });

    app.log.info(`🚀 Server running on http://localhost:${config.port}`);
    app.log.info(`🔥 Environment: ${config.nodeEnv}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
