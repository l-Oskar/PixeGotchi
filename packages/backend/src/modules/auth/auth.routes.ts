import { FastifyInstance } from "fastify";
import { AuthController } from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  const controller = new AuthController();

  app.post("/telegram", controller.telegramAuth.bind(controller));
  app.post("/refresh", controller.refreshToken.bind(controller));
}
