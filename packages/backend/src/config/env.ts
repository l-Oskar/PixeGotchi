import { config as dotenvConfig } from "dotenv";
import { z } from "zod";

dotenvConfig();

const envShema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().transform(Number).default("3000"),

  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),

  TELEGRAM_BOT_TOKEN: z.string(),

  TON_NETWORK: z.enum(["mainnet", "testnet"]).default("testnet"),
  TON_API_KEY: z.string().optional(),
});

const parsedEnv = envShema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const config = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  redisUrl: parsedEnv.data.REDIS_URL,
  jwtSecret: parsedEnv.data.JWT_SECRET,
  jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  telegramBotToken: parsedEnv.data.TELEGRAM_BOT_TOKEN,
  tonNetwork: parsedEnv.data.TON_NETWORK,
  tonApiKey: parsedEnv.data.TON_API_KEY,
};
