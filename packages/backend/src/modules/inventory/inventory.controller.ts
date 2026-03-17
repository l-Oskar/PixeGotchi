import { FastifyRequest, FastifyReply } from "fastify";
import { Inventory } from "./inventory.service";
import { ITEMS_BY_ID, ItemType } from "@shared";
import { z } from "zod";

const addItemScema = z.object({
  itemId: z.enum(ITEMS_BY_ID as any),
  quantity: z.number().optional(),
});

const useItemScheme = z.object({
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

  async getDetailedInventory(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;

    const userDetailedInventory =
      await this.inventoryService.getInventoryWithDetails(userId);

    return reply.send(userDetailedInventory);
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const { itemId, quantity } = addItemScema.parse(request.body);

    const addItem = await this.inventoryService.addItem(
      userId,
      itemId,
      quantity,
    );

    return reply.send(addItem);
  }

  async useItem(request: FastifyRequest, reply: FastifyReply) {
    const useId = (request.user as any).useId;

    const { itemId, quantity } = useItemScheme.parse(request.body);

    const useItem = await this.inventoryService.useItem(
      useId,
      itemId,
      quantity,
    );

    return reply.send(useItem);
  }
}
