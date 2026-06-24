import { z } from "zod";

const clientLogMetadataSchema = z
  .object({
    component: z.string().max(100).optional(),
    apiMethod: z.string().max(10).optional(),
    apiPath: z.string().max(500).optional(),
    statusCode: z.number().int().min(100).max(599).optional(),
    release: z.string().max(100).optional(),
    telegramPlatform: z.string().max(50).optional(),
  })
  .strict();

export const clientLogSchema = z
  .object({
    level: z.enum(["error", "warn"]),
    type: z.enum(["runtime", "unhandled_rejection", "api"]),
    message: z.string().min(1).max(2_000),
    stack: z.string().max(8_000).optional(),
    path: z.string().min(1).max(500),
    requestId: z.string().max(100).optional(),
    occurredAt: z.string().datetime({ offset: true }),
    metadata: clientLogMetadataSchema.optional(),
  })
  .strict();

export type ClientLogPayload = z.infer<typeof clientLogSchema>;

