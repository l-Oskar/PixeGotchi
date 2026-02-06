import { FastifyInstance } from "fastify";
import { PixegotchiController } from "./pixegotchi.controller";

export async function pixegotchiRoutes(app: FastifyInstance) {
  const controller = new PixegotchiController();

  app.addHook("onRequest", app.authenticate);

  app.get("/", controller.getAll.bind(controller));
  app.get("/active", controller.getActive.bind(controller));
  app.get("/:id", controller.getById.bind(controller));
  app.post("/get_egg", controller.getEgg.bind(controller));
  app.post("/hatch/:id", controller.hatch.bind(controller));
  app.delete("/:id", controller.release.bind(controller));

  app.post("/:id/feed", controller.feed.bind(controller));
  app.post("/:id/play", controller.play.bind(controller));
  app.post("/:id/sleep", controller.sleep.bind(controller));
  app.post("/:id/clean", controller.clean.bind(controller));
  app.post("/:id/heal", controller.heal.bind(controller));

  app.patch("/:id/rename", controller.rename.bind(controller));
}
