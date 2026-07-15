import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateCosmeticMarketplaceListingInput } from "@pixegotchi/shared";
import { z } from "zod";
import { MarketplaceService } from "./marketplace.service";

const createListingSchema = z
  .object({
    listingType: z.literal("cosmetic"),
    cosmeticAssetId: z.string().trim().min(1).max(64),
    price: z.number().finite().positive().max(1_000_000_000),
    currency: z.literal("pgc"),
  })
  .strict();

const listingParamsSchema = z.object({
  listingId: z.coerce.number().int().positive(),
});

export class MarketplaceController {
  private marketplaceService = new MarketplaceService();

  async getListings(_request: FastifyRequest, reply: FastifyReply) {
    const listings = await this.marketplaceService.getActiveListings();
    return reply.send(listings);
  }

  async createListing(request: FastifyRequest, reply: FastifyReply) {
    const input = createListingSchema.parse(
      request.body,
    ) as CreateCosmeticMarketplaceListingInput;
    const listing = await this.marketplaceService.createCosmeticListing(
      request.user.userId,
      input,
    );
    return reply.code(201).send(listing);
  }

  async buyListing(request: FastifyRequest, reply: FastifyReply) {
    const { listingId } = listingParamsSchema.parse(request.params);
    const result = await this.marketplaceService.buyCosmeticListing(
      request.user.userId,
      listingId,
    );
    return reply.send(result);
  }

  async cancelListing(request: FastifyRequest, reply: FastifyReply) {
    const { listingId } = listingParamsSchema.parse(request.params);
    await this.marketplaceService.cancelCosmeticListing(
      request.user.userId,
      listingId,
    );
    return reply.code(204).send();
  }
}
