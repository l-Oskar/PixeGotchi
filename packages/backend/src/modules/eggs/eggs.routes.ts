import { FastifyInstance } from "fastify/types/instance";
import { EggsController } from "./eggs.controller";

export async function eggsRoutes(app: FastifyInstance) {
  const controller = new EggsController();

  app.addHook("onRequest", app.authenticate);

  app.get("/", controller.getAll.bind(controller));
  app.get("/hatching_egg", controller.getHatchingEgg.bind(controller));
  app.get("/:id", controller.getEggById.bind(controller));
  app.post("/get_egg", controller.getEgg.bind(controller));

  app.post("/hatch/start", controller.startHatching.bind(controller));
  app.post("/tap/batch", controller.batchTap.bind(controller));
  app.get("/:id/status", controller.getHatchingStatus.bind(controller));
  app.post("/:id/open", controller.hatchEgg.bind(controller));
  app.post("/:id/cancel", controller.cancelHatching.bind(controller));
}
