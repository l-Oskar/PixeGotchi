import { FastifyInstance } from "fastify";
import { VaultController } from "./vault.controller";

export async function vaultRoutes(app: FastifyInstance) {
  const controller = new VaultController();

  app.addHook("onRequest", app.authenticate);

  app.get("/stats", controller.getStatsVault.bind(controller));
  app.get("/", controller.getAllVault.bind(controller));
  app.post(
    "/:pixegotchiId/activate",
    controller.activateFromVault.bind(controller),
  );
}
