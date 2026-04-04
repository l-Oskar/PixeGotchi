import { FastifyRequest, FastifyReply } from "fastify";
import { ChestService } from "./chest.service";
import { z } from "zod";

export class ChestController {
  private chestService = new ChestService();

  async getAllChest(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const allChests = await this.chestService.getAllChests(userId);

    return reply.send(allChests);
  }

  async getRandomChest(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const randomChest = await this.chestService.getRandomChest(userId);

    return reply.send(randomChest);
  }

  async openChest(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const chestId = parseInt(request.id);

    const reward = await this.chestService.openChest(userId, chestId);

    return reply.send(reward);
  }
}
