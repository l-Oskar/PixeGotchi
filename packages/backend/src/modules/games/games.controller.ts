import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { GamesService } from "./games.service";

const startSessionSchema = z.object({
  pixegotchiId: z.number().int().positive(),
  gameId: z.string().min(1).max(50),
});

const completeSessionParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const completeSessionBodySchema = z.object({
  score: z.number().int().min(0),
});

const historyQuerySchema = z.object({
  gameId: z.string().min(1).max(50).optional(),
});

export class GamesController {
  private gamesService = new GamesService();

  async startSession(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user.userId;
    const input = startSessionSchema.parse(request.body);
    const session = await this.gamesService.startSession(userId, input);

    return reply.code(201).send(session);
  }

  async completeSession(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = request.user.userId;
    const { id } = completeSessionParamsSchema.parse(request.params);
    const input = completeSessionBodySchema.parse(request.body);
    const session = await this.gamesService.completeSession(userId, id, input);

    return reply.send(session);
  }

  async getUserSessions(
    request: FastifyRequest<{ Querystring: { gameId?: string } }>,
    reply: FastifyReply,
  ) {
    const userId = request.user.userId;
    const { gameId } = historyQuerySchema.parse(request.query);
    const sessions = await this.gamesService.getUserSessions(userId, gameId);

    return reply.send(sessions);
  }
}
