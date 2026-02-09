import { FastifyRequest, FastifyReply } from "fastify";
import { EggService } from "./eggs.service";
import { z } from "zod";

const hatchSchema = z.object({
  name: z.string().min(3).max(30).optional(),
});

export class EggsController {
  private eggService = new EggService();

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const eggs = await this.eggService.findByUserId(userId);

    return reply.send(eggs);
  }

  async getEggById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const eggId = parseInt(request.params.id);

    const egg = await this.eggService.getEggById(userId, eggId);
    return reply.send(egg);
  }

  async getEgg(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const egg = await this.eggService.createEgg(userId);

    return reply.send(egg);
  }

  async hatchEgg(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const eggId = parseInt(request.params.id);
    const { name } = hatchSchema.parse(request.body);

    const hatchedPixegotchi = await this.eggService.hatchEgg(
      userId,
      eggId,
      name,
    );

    return reply.send(hatchedPixegotchi);
  }
}
