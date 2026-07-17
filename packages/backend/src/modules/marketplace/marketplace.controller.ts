import type { FastifyReply, FastifyRequest } from "fastify";
import {
  ChestType,
  ListingType,
  type CreateMarketplaceListingInput,
} from "@pixegotchi/shared";
import { z } from "zod";
import { MarketplaceService } from "./marketplace.service";

const moneySchema = z
  .string()
  .trim()
  .regex(/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/);
const currencySchema = z.literal("pgc");
const quantitySchema = z.number().int().positive().max(2_147_483_647);

const createListingSchema = z.discriminatedUnion("listingType", [
  z
    .object({
      listingType: z.literal("egg"),
      eggId: z.number().int().positive(),
      unitPrice: moneySchema,
      currency: currencySchema,
    })
    .strict(),
  z
    .object({
      listingType: z.literal("item"),
      itemId: z.string().trim().min(1).max(50),
      quantity: quantitySchema,
      unitPrice: moneySchema,
      currency: currencySchema,
    })
    .strict(),
  z
    .object({
      listingType: z.literal("chest"),
      chestType: z.enum(
        Object.values(ChestType) as [ChestType, ...ChestType[]],
      ),
      quantity: quantitySchema,
      unitPrice: moneySchema,
      currency: currencySchema,
    })
    .strict(),
  z
    .object({
      listingType: z.literal("cosmetic"),
      cosmeticAssetId: z.string().trim().min(1).max(64),
      unitPrice: moneySchema,
      currency: currencySchema,
    })
    .strict(),
  z
    .object({
      listingType: z.literal("pixegotchi"),
      pixegotchiId: z.number().int().positive(),
      unitPrice: moneySchema,
      currency: currencySchema,
    })
    .strict(),
]);

const listingParamsSchema = z.object({
  listingId: z.coerce.number().int().positive(),
});

const listingQuerySchema = z.object({
  listingType: z
    .enum(Object.values(ListingType) as [ListingType, ...ListingType[]])
    .optional(),
  mine: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

const sellableQuerySchema = z.object({
  listingType: z.enum(
    Object.values(ListingType) as [ListingType, ...ListingType[]],
  ),
});

const buyListingSchema = z.object({
  quantity: quantitySchema,
});

export class MarketplaceController {
  private marketplaceService = new MarketplaceService();

  getConfig(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send(this.marketplaceService.getConfig());
  }

  async getListings(request: FastifyRequest, reply: FastifyReply) {
    const { listingType, mine } = listingQuerySchema.parse(request.query);
    const listings = await this.marketplaceService.getListings(
      request.user.userId,
      listingType,
      mine === true,
    );
    return reply.send(listings);
  }

  async getSellableAssets(request: FastifyRequest, reply: FastifyReply) {
    const { listingType } = sellableQuerySchema.parse(request.query);
    const result = await this.marketplaceService.getSellableAssets(
      request.user.userId,
      listingType,
    );
    return reply.send(result);
  }

  async createListing(request: FastifyRequest, reply: FastifyReply) {
    const input = createListingSchema.parse(
      request.body,
    ) as CreateMarketplaceListingInput;
    const listing = await this.marketplaceService.createListing(
      request.user.userId,
      input,
    );
    return reply.code(201).send(listing);
  }

  async buyListing(request: FastifyRequest, reply: FastifyReply) {
    const { listingId } = listingParamsSchema.parse(request.params);
    const { quantity } = buyListingSchema.parse(request.body);
    const result = await this.marketplaceService.buyListing(
      request.user.userId,
      listingId,
      quantity,
    );
    return reply.send(result);
  }

  async cancelListing(request: FastifyRequest, reply: FastifyReply) {
    const { listingId } = listingParamsSchema.parse(request.params);
    await this.marketplaceService.cancelListing(
      request.user.userId,
      listingId,
    );
    return reply.code(204).send();
  }
}
