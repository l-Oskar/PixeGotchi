import { FastifyRequest, FastifyReply } from "fastify";
import { ChestService } from "./chest.service";
import { z } from "zod";
import { ChestType } from "@shared";

const specificChestSchema = z.object({
  chestType: z.enum(Object.values(ChestType) as [string, ...string[]]),
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
    const { chestType } = specificChestSchema.parse(request.body);

    const specificChest = await this.chestService.getSpecificChest(
      userId,
      chestType as ChestType,
    );

    return reply.send(specificChest);
  }

  async openChest(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const { chestType } = specificChestSchema.parse(request.body);

    const reward = await this.chestService.openChest(
      userId,
      chestType as ChestType,
    );

    return reply.send(reward);
  }
}
