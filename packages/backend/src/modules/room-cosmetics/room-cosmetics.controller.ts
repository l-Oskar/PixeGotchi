import type { FastifyReply, FastifyRequest } from "fastify";
import type {
  EquipRoomCosmeticInput,
  SaveRoomLoadoutInput,
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

const roomPositionSchema = z
  .number()
  .int()
  .refine(
    (position) => [1, 2, 3, 4, 6, 7, 8, 9, 10, 11].includes(position),
    "Invalid room position",
  );

const saveRoomLoadoutSchema = z
  .object({
    environmentId: z.string().trim().min(1).max(64),
    floorId: z.string().trim().min(1).max(64).nullable(),
    placements: z
      .array(
        z
          .object({
            cosmeticAssetId: z.string().trim().min(1).max(64),
            position: roomPositionSchema,
          })
          .strict(),
      )
      .max(32),
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

  async getEditorInventory(request: FastifyRequest, reply: FastifyReply) {
    const inventory = await this.roomCosmeticsService.getEditorInventory(
      request.user.userId,
    );
    return reply.send(inventory);
  }

  async getCurrentLoadout(request: FastifyRequest, reply: FastifyReply) {
    const loadout = await this.roomCosmeticsService.getOrCreateCurrentLoadout(
      request.user.userId,
    );
    return reply.send(loadout);
  }

  async saveLoadout(request: FastifyRequest, reply: FastifyReply) {
    const input = saveRoomLoadoutSchema.parse(
      request.body,
    ) as SaveRoomLoadoutInput;
    const result = await this.roomCosmeticsService.saveLoadout(
      request.user.userId,
      input,
    );
    return reply.send(result);
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
