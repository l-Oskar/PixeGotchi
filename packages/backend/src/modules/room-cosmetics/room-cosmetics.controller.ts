import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  EquipRoomCosmeticInput,
  UnequipRoomCosmeticInput,
} from "@pixegotchi/shared";
import { z } from "zod";
import { RoomCosmeticsService } from "./room-cosmetics.service";

const roomCosmeticMutationSchema = z
  .object({
    cosmeticAssetId: z.string().trim().min(1).max(64),
    position: z
      .number()
      .int()
      .refine(
        (position) =>
          [1, 2, 3, 4, 6, 7, 8, 9, 10, 11].includes(position),
        "Invalid room position",
      )
      .optional(),
  })
  .strict();

export class RoomCosmeticsController {
  private roomCosmeticsService = new RoomCosmeticsService();

  async getCatalog(_request: FastifyRequest, reply: FastifyReply) {
    const catalog = await this.roomCosmeticsService.getCatalog();
    return reply.send(catalog);
  }

  async getOwnership(request: FastifyRequest, reply: FastifyReply) {
    const ownership = await this.roomCosmeticsService.getOwnership(
      request.user.userId,
    );
    return reply.send(ownership);
  }

  async getCurrentLoadout(request: FastifyRequest, reply: FastifyReply) {
    const loadout = await this.roomCosmeticsService.getCurrentLoadout(
      request.user.userId,
    );
    return reply.send(loadout);
  }

  async equip(request: FastifyRequest, reply: FastifyReply) {
    const input = roomCosmeticMutationSchema.parse(
      request.body,
    ) as EquipRoomCosmeticInput;
    const result = await this.roomCosmeticsService.equip(
      request.user.userId,
      input,
    );
    return reply.send(result);
  }

  async unequip(request: FastifyRequest, reply: FastifyReply) {
    const input = roomCosmeticMutationSchema.parse(
      request.body,
    ) as UnequipRoomCosmeticInput;
    const result = await this.roomCosmeticsService.unequip(
      request.user.userId,
      input,
    );
    return reply.send(result);
  }
}
