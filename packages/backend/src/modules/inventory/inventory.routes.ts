import { FastifyInstance } from "fastify";
import { InventoryController } from "./inventory.controller";

export async function inventoryRoutes(app: FastifyInstance) {
  const controller = new InventoryController();

  app.addHook("onRequest", app.authenticate);

  app.get("/", controller.getInventory.bind(controller));
}
