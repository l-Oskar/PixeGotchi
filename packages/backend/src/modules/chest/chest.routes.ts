import { FastifyInstance } from "fastify";
import { ChestController } from "./chest.controller";

export async function chestRoutes(app: FastifyInstance) {
  const controller = new ChestController();

  app.addHook("onRequest", app.authenticate);

  app.get("/", controller.getAllChest.bind(controller));
  app.post("/random_chest", controller.getRandomChest.bind(controller));
  app.post("/specific_chest", controller.getSpecificChest.bind(controller));
}
