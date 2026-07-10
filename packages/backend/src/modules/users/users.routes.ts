import { FastifyInstance } from "fastify";
import { UsersController } from "./users.controller";

export async function usersRoutes(app: FastifyInstance) {
  const controller = new UsersController();

  app.addHook("onRequest", app.authenticate);

  app.get("/me", controller.getProfile.bind(controller));
  app.patch("/me", controller.updateProfile.bind(controller));
  app.post("/add_balance", controller.updateUserPgc.bind(controller));
}
