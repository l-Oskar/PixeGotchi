import { FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "./auth.service";
import { config } from "@/config/env";
import { z } from "zod";

const telegramAuthShema = z.object({
  initData: z.string(),
});

export class AuthController {
  private authService = new AuthService();

  async telegramAuth(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { initData } = telegramAuthShema.parse(request.body);

      const result = await this.authService.authenticateTelegram(initData);

      const token = request.server.jwt.sign(
        {
          userId: result.user.id,
        },
        {
          expiresIn: config.jwtExpiresIn,
        },
      );
      return reply.send({ ...result, token });
    } catch (err) {
      request.log.error(
        {
          err,
          event: "telegram_auth_failed",
        },
        "Telegram authentication failed",
      );
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: "Invalig Telegram init data" });
      }

      return reply.status(500).send({
        error: "Internal error 2",
        message: err instanceof Error ? err.message : err,
      });
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
      const newToken = request.server.jwt.sign(
        {
          userId: request.user.userId,
        },
        {
          expiresIn: config.jwtExpiresIn,
        },
      );

      return reply.send({ token: newToken });
    } catch (err) {
      return reply.status(401).send({ error: "Invalid token" });
    }
  }
}
