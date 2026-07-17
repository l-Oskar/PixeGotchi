import type { FastifyInstance } from "fastify";
import { MarketplaceTreasuryController } from "./marketplace-treasury.controller";

export async function marketplaceTreasuryRoutes(app: FastifyInstance) {
  const controller = new MarketplaceTreasuryController();

  app.addHook("onRequest", app.authenticate);
  app.addHook("onRequest", app.requireAdmin);

  app.get("/treasury", controller.getBalances.bind(controller));
  app.get(
    "/treasury/transactions",
    controller.getTransactions.bind(controller),
  );
  app.post(
    "/treasury/distribute",
    controller.distribute.bind(controller),
  );
}
