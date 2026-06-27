import { FastifyInstance } from "fastify";
import { ItemsController } from "./items.controller";

export async function itemsRoutes(app: FastifyInstance) {
  const controller = new ItemsController();

  app.get("/", controller.getAllItems.bind(controller));
  app.get("/type/:itemType", controller.getitemsByType.bind(controller));
  app.get("/rarity/:rarityType", controller.getitemsByRarity.bind(controller));
  app.get("/:id", controller.getItemDetails.bind(controller));
}
