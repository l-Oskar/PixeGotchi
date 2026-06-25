import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "./users.service";

export class UsersController {
  private userService = new UserService();

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request.user as any).userId;
    const profile = await this.userService.getProfile(userId);

    if (!profile) {
      return reply.code(404).send({ error: "User not found" });
    }

    return reply.send(profile);
  }

  async updateProfile(_request: FastifyRequest, reply: FastifyReply) {
    ///
    return reply.code(501).send({ error: "Not implemented yet" });
  }
}
