import { FastifyRequest, FastifyReply } from "fastify";
import { Inventory } from "./inventory.service";
import { ITEMS_BY_ID, ItemType } from "@shared";
import { z } from "zod";

const addItemScema = z.object({
  itemId: z.enum(ITEMS_BY_ID as any),
  itemType: z.enum(ItemType as any),
  quantity: z.number().optional(),
});

const consumeItemScheme = z.object({
  itemId: z.enum(ITEMS_BY_ID as any),
  quantity: z.number().optional(),
});

export class InventoryController {
  private inventoryService = new Inventory();

  async getInventory(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const userInventory = await this.inventoryService.getInventory(userId);

    return reply.send(userInventory);
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const { itemId, itemType, quantity } = addItemScema.parse(request.body);

    const addItem = await this.inventoryService.addItem(
      userId,
      itemId,
      itemType,
      quantity,
    );

    return reply.send(addItem);
  }
}
