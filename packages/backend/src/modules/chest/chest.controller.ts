import { FastifyRequest, FastifyReply } from "fastify";
import { ChestService } from "./chest.service";
import { z } from "zod";

const specificChestSchema = z.object({
  type: z.string(),
});

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

  async getSpecificChest(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const { type } = specificChestSchema.parse(request.body);

    const specificChest = this.chestService.getSpecificChest(userId, type);

    return reply.send(specificChest);
  }

  async openChest(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const chestId = parseInt(request.params.id);

    const reward = await this.chestService.openChest(userId, chestId);

    return reply.send(reward);
  }
}
