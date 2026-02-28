import { FastifyRequest, FastifyReply } from "fastify";
import { VaultService } from "./vault.service";
import { z } from "zod";

export class VaultController {
  private vaultService = new VaultService();

  async getAllVault(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const getAllVault = await this.vaultService.getAllVault(userId);

    return reply.send(getAllVault);
  }
}
