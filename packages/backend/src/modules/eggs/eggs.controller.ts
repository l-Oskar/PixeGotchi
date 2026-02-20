import { FastifyRequest, FastifyReply } from "fastify";
import { EggService } from "./eggs.service";
import { z } from "zod";

const startHatchingSchema = z.object({
  eggId: z.number(),
});

const hatchSchema = z.object({
  name: z.string().min(3).max(30).optional(),
});

export class EggsController {
  private eggService = new EggService();

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const eggs = await this.eggService.findAllEggs(userId);

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

  async startHatching(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const { eggId } = startHatchingSchema.parse(request.body);

    const egg = await this.eggService.startHatching(userId, eggId);
    return reply.send(egg);
  }

  async getHatchingStatus(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const eggId = parseInt(request.params.id);

    const status = await this.eggService.getHatchingStatus(userId, eggId);

    return reply.send(status);
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

  async cancelHatching(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const eggId = parseInt(request.params.id);

    const egg = await this.eggService.cancelHatching(userId, eggId);
    return reply.send(egg);
  }
}
