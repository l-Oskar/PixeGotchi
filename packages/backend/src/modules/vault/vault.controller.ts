import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { VaultService } from "./vault.service";

const pixegotchiIdParamSchema = z.coerce.number().int().positive();

export class VaultController {
  private vaultService = new VaultService();

  async getStatsVault(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const getStatsVault = await this.vaultService.getStatsVault(userId);

    return reply.send(getStatsVault);
  }

  async getAllVault(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const getAllVault = await this.vaultService.getAllVault(userId);

    return reply.send(getAllVault);
  }

  async activateFromVault(
    request: FastifyRequest<{ Params: { pixegotchiId: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const pixegotchiId = pixegotchiIdParamSchema.parse(
      request.params.pixegotchiId,
    );
    const activatedPixegotchi = await this.vaultService.activateFromVault(
      userId,
      pixegotchiId,
    );

    return reply.send(activatedPixegotchi);
  }
}
