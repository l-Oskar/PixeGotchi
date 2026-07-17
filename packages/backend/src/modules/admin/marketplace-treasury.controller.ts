import type {
  DistributeMarketplaceTreasuryInput,
} from "@pixegotchi/shared";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { MarketplaceTreasuryService } from "./marketplace-treasury.service";

const transactionsQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    cursor: z.coerce.number().int().positive().optional(),
  })
  .strict();

const distributeSchema = z
  .object({
    userId: z.number().int().positive(),
    amount: z
      .string()
      .trim()
      .regex(/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/),
    reason: z.string().trim().min(3).max(200),
  })
  .strict();

export class MarketplaceTreasuryController {
  private treasuryService = new MarketplaceTreasuryService();

  async getBalances(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(await this.treasuryService.getBalances());
  }

  async getTransactions(request: FastifyRequest, reply: FastifyReply) {
    const { limit, cursor } = transactionsQuerySchema.parse(request.query);
    return reply.send(
      await this.treasuryService.getTransactions(limit, cursor),
    );
  }

  async distribute(request: FastifyRequest, reply: FastifyReply) {
    const input = distributeSchema.parse(
      request.body,
    ) as DistributeMarketplaceTreasuryInput;
    const result = await this.treasuryService.distribute(
      request.user.userId,
      input,
    );
    return reply.code(201).send(result);
  }
}
