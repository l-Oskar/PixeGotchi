import { FastifyInstance } from "fastify/types/instance";
import { EggsController } from "./eggs.controller";

export async function eggsRoutes(app: FastifyInstance) {
  const controller = new EggsController();

  app.addHook("onRequest", app.authenticate);

  app.get("/", controller.getAll.bind(controller));
  app.get("/:id", controller.getEggById.bind(controller));
  app.post("/get_egg", controller.getEgg.bind(controller));
  app.post("/:id/hatch", controller.hatchEgg.bind(controller));
}
