import { FastifyRequest, FastifyReply } from "fastify";
import { PixegotchiService } from "./pixegotchi.service";
import { CooldownManager, cooldownTime } from "@/utils/cooldown";
import { z } from "zod";

const hatchSchema = z.object({
  name: z.string().min(3).max(30).optional(),
});

const renameSchema = z.object({
  name: z.string().min(3).max(30),
});

export class PixegotchiController {
  private pixegotchiService = new PixegotchiService();
  private cooldownManager = new CooldownManager();

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const pixegotchis = await this.pixegotchiService.findByUserId(userId);
    return reply.send(pixegotchis);
  }

  async getActive(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const activePixegotchi = await this.pixegotchiService.findActive(userId);

    // if (!activePixegotchi) {
    //   return reply.send({ error: "No active pixegotchi" });
    // }

    return reply.send(activePixegotchi);
  }

  async getById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const id = parseInt(request.params.id);
    const pixegotchi = await this.pixegotchiService.findById(id, userId);

    if (!pixegotchi) {
      return reply.status(404).send({ error: "Pixegotchi not found" });
    }

    return reply.send(pixegotchi);
  }

  // async feed(
  //   request: FastifyRequest<{ Params: { id: string; itemId: string } }>,
  //   reply: FastifyReply,
  // ) {
  //   const userId = (request.user as any).userId;
  //   const id = parseInt(request.params.id);
  //   const itemId = request.params.itemId;

  //   const hasCooldown = await this.cooldownManager.checkCooldown(
  //     userId.toString(),
  //     `feed:${id}`,
  //   );

  //   if (hasCooldown) {
  //     const remaining = await this.cooldownManager.getRemainingTime(
  //       userId.toString(),
  //       `feed:${id}`,
  //     );
  //     return reply
  //       .code(429)
  //       .send({ error: "Action on cooldown", remainingSeconds: remaining });
  //   }

  //   const pixegotchi = await this.pixegotchiService.feed(id, userId, itemId);

  //   await this.cooldownManager.setCooldown(
  //     userId.toString(),
  //     `feed:${id}`,
  //     cooldownTime.FEED_CD,
  //   );

  //   return reply.send(pixegotchi);
  // }

  // async play(
  //   request: FastifyRequest<{ Params: { id: string } }>,
  //   reply: FastifyReply,
  // ) {
  //   const userId = (request.user as any).userId;
  //   const id = parseInt(request.params.id);

  //   const hasCooldown = await this.cooldownManager.checkCooldown(
  //     userId.toString(),
  //     `play:${id}`,
  //   );

  //   if (hasCooldown) {
  //     const remaining = await this.cooldownManager.getRemainingTime(
  //       userId.toString(),
  //       `play:${id}`,
  //     );

  //     return reply
  //       .code(429)
  //       .send({ error: "Action on cooldown", remainingSeconds: remaining });
  //   }

  //   const pixegotchi = await this.pixegotchiService.play(id, userId);

  //   await this.cooldownManager.setCooldown(
  //     userId.toString(),
  //     `play:${id}`,
  //     cooldownTime.PLAY_CD,
  //   );

  //   return reply.send(pixegotchi);
  // }

  // async sleep(
  //   request: FastifyRequest<{ Params: { id: string } }>,
  //   reply: FastifyReply,
  // ) {
  //   const userId = (request.user as any).userId;
  //   const id = parseInt(request.params.id);

  //   const hasCooldown = await this.cooldownManager.checkCooldown(
  //     userId.toString(),
  //     `sleep:${id}`,
  //   );

  //   if (hasCooldown) {
  //     const remaining = await this.cooldownManager.getRemainingTime(
  //       userId.toString(),
  //       `sleep:${id}`,
  //     );

  //     return reply
  //       .code(429)
  //       .send({ error: "Action on cooldown", remainingSeconds: remaining });
  //   }

  //   const pixegotchi = await this.pixegotchiService.sleep(id, userId);

  //   await this.cooldownManager.setCooldown(
  //     userId.toString(),
  //     `sleep:${id}`,
  //     cooldownTime.SLEEP_CD,
  //   );

  //   return reply.send(pixegotchi);
  // }

  // async clean(
  //   request: FastifyRequest<{ Params: { id: string } }>,
  //   reply: FastifyReply,
  // ) {
  //   const userId = (request.user as any).userId;
  //   const id = parseInt(request.params.id);

  //   const hasCooldown = await this.cooldownManager.checkCooldown(
  //     userId.toString(),
  //     `clean:${id}`,
  //   );

  //   if (hasCooldown) {
  //     const remaining = await this.cooldownManager.getRemainingTime(
  //       userId.toString(),
  //       `clean:${id}`,
  //     );

  //     return reply
  //       .code(429)
  //       .send({ error: "Action on cooldown", remainingSeconds: remaining });
  //   }

  //   const pixegotchi = await this.pixegotchiService.clean(id, userId);

  //   await this.cooldownManager.setCooldown(
  //     userId.toString(),
  //     `clean:${id}`,
  //     cooldownTime.CLEAN_CD,
  //   );

  //   return reply.send(pixegotchi);
  // }

  // async heal(
  //   request: FastifyRequest<{ Params: { id: string } }>,
  //   reply: FastifyReply,
  // ) {
  //   const userId = (request.user as any).userId;
  //   const id = parseInt(request.params.id);

  //   const hasCooldown = await this.cooldownManager.checkCooldown(
  //     userId.toString(),
  //     `heal:${id}`,
  //   );

  //   if (hasCooldown) {
  //     const remaining = await this.cooldownManager.checkCooldown(
  //       userId.toString(),
  //       `heal:${id}`,
  //     );

  //     return reply
  //       .code(429)
  //       .send({ error: "Action on cooldown", remainingSeconds: remaining });
  //   }

  //   const pixegotchi = await this.pixegotchiService.heal(id, userId);

  //   await this.cooldownManager.setCooldown(
  //     userId.toString(),
  //     `heal:${id}`,
  //     cooldownTime.HEAL_CD,
  //   );

  //   return reply.send(pixegotchi);
  // }

  async rename(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const id = parseInt(request.params.id);
    const { name } = renameSchema.parse(request.body);

    return reply.code(501).send({ error: "Not implemented yet" });
  }

  async release(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) {
    const userId = (request.user as any).userId;
    const id = parseInt(request.params.id);

    return reply.code(501).send({ message: "Not implemented yet" });
  }
}
