import { FastifyInstance } from "fastify";
import { InventoryController } from "./inventory.controller";

export async function inventoryRoutes(app: FastifyInstance) {
  const controller = new InventoryController();

  app.addHook("onRequest", app.authenticate);

  app.get("/", controller.getInventory.bind(controller));
  app.get("/detailed", controller.getDetailedInventory.bind(controller))
  app.post("/add", controller.addItem.bind(controller))
  app.post("/use", controller.useItem.bind(controller))
}
