import { FastifyRequest, FastifyReply } from "fastify";
import { ItemsService } from "./items.service";
import { ItemType, RarityType } from "@pixegotchi/shared";

export class ItemsController {
  private itemsService = new ItemsService();

  async getItemDetails(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const itemId = request.params.id;

    const itemDetails = await this.itemsService.getItemDetails(itemId);

    return reply.send(itemDetails);
  }

  async getAllItems(_request: FastifyRequest, reply: FastifyReply) {
    const allItems = await this.itemsService.getAllItems();

    return reply.send(allItems);
  }

  async getitemsByType(
    request: FastifyRequest<{ Params: { itemType: ItemType } }>,
    reply: FastifyReply,
  ) {
    const itemType = request.params.itemType;

    const typeItems = await this.itemsService.getItemsByType(itemType);

    return reply.send(typeItems);
  }

  async getitemsByRarity(
    request: FastifyRequest<{ Params: { rarityType: RarityType } }>,
    reply: FastifyReply,
  ) {
    const rarityType = request.params.rarityType;

    const rarityItems = await this.itemsService.getItemsByRarity(rarityType);

    return reply.send(rarityItems);
  }
}
