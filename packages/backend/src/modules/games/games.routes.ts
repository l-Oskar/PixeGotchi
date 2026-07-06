import { FastifyInstance } from "fastify";
import { GamesController } from "./games.controller";

export async function gamesRoutes(app: FastifyInstance) {
  const controller = new GamesController();

  app.addHook("onRequest", app.authenticate);

  app.post(
    "/start",
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
          hook: "preHandler",
          keyGenerator: (request) => `games:start:${request.user.userId}`,
        },
      },
    },
    controller.startSession.bind(controller),
  );

  app.post("/:id/complete", controller.completeSession.bind(controller));
  app.get("/history", controller.getUserSessions.bind(controller));
}
