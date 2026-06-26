import { FastifyRequest, FastifyReply } from "fastify";
import { Inventory } from "./inventory.service";
import { ITEMS_BY_ID, ChestType } from "@pixegotchi/shared";
import { z } from "zod";

const positiveQuantitySchema = z.number().int().positive().optional();

const addItemScema = z.object({
  itemId: z.enum(Object.keys(ITEMS_BY_ID) as [string, ...string[]]),
  quantity: positiveQuantitySchema,
});

const useItemScheme = z.object({
  itemId: z.enum(Object.keys(ITEMS_BY_ID) as [string, ...string[]]),
  quantity: positiveQuantitySchema,
});

const specificChestSchema = z.object({
  chestType: z.enum(Object.values(ChestType) as [string, ...string[]]),
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
    const userId = (request.user as any).userId;

    const { itemId, quantity } = useItemScheme.parse(request.body);

    const useItem = await this.inventoryService.useItem(
      userId,
      itemId,
      quantity,
    );

    return reply.send(useItem);
  }

  async openChest(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const { chestType } = specificChestSchema.parse(request.body);

    const reward = await this.inventoryService.openChest(
      userId,
      chestType as ChestType,
    );

    return reply.send(reward);
  }
}
