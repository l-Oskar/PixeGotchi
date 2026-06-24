import type { FastifyInstance, FastifyRequest } from "fastify";
import { clientLogSchema } from "./client-logs.schema";
import { sanitizeClientLog } from "./client-logs.sanitizer";

async function getOptionalUserId(
  request: FastifyRequest,
): Promise<number | undefined> {
  if (!request.headers.authorization?.startsWith("Bearer ")) {
    return undefined;
  }

  try {
    await request.jwtVerify();
    return request.user.userId;
  } catch {
    return undefined;
  }
}

export async function clientLogsRoutes(app: FastifyInstance) {
  app.post(
    "/client",
    {
      bodyLimit: 16 * 1024,
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 minute",
        },
      },
    },
    async (request, reply) => {
      const parsedPayload = clientLogSchema.safeParse(request.body);

      if (!parsedPayload.success) {
        return reply.code(400).send({
          error: "Invalid client log payload",
        });
      }

      const payload = sanitizeClientLog(parsedPayload.data);
      const userId = await getOptionalUserId(request);

      request.log[payload.level](
        {
          event: "client_error",
          source: "frontend",
          userId,
          clientIp: request.ip,
          userAgent: request.headers["user-agent"]?.slice(0, 500),
          client: payload,
        },
        "Frontend error reported",
      );

      return reply.code(202).send({ accepted: true });
    },
  );
}

