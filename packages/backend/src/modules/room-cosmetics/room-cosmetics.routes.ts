import type { FastifyInstance } from "fastify";
import { RoomCosmeticsController } from "./room-cosmetics.controller";

export async function roomCosmeticsRoutes(app: FastifyInstance) {
  const controller = new RoomCosmeticsController();

  app.addHook("onRequest", app.authenticate);

  app.get("/catalog", controller.getCatalog.bind(controller));
  app.get("/ownership", controller.getOwnership.bind(controller));
  app.get("/inventory", controller.getEditorInventory.bind(controller));
  app.get("/loadout", controller.getCurrentLoadout.bind(controller));
  app.put("/loadout", controller.saveLoadout.bind(controller));
  app.post("/equip", controller.equip.bind(controller));
  app.post("/unequip", controller.unequip.bind(controller));
}
