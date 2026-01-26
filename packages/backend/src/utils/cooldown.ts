import Redis from "ioredis";
import { config } from "@/config/env";

export class CooldownManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(config.redisUrl);
  }

  async setCooldown(
    userId: string,
    action: string,
    seconds: number,
  ): Promise<void> {
    const key = `cooldown:${userId}:${action}`;
    await this.redis.setex(key, seconds, "true");
  }

  async checkCooldown(userId: string, action: string): Promise<boolean> {
    const key = `cooldown:${userId}:${action}`;
    const exist = await this.redis.exists(key);
    return exist === 1;
  }

  async getRemainingTime(userId: string, action: string): Promise<number> {
    const key = `cooldown:${userId}:${action}`;
    const ttl = await this.redis.ttl(key);
    return ttl > 0 ? ttl : 0;
  }

  async clearCooldown(userId: string, action: string): Promise<void> {
    const key = `cooldown:${userId}:${action}`;
    await this.redis.del(key);
  }
}

export const cooldownTime = {
  FEED_CD: 10 * 60,
  PLAY_CD: 60,
  SLEEP_CD: 1 * 60 * 60,
  CLEAN_CD: 2 * 60 * 60,
  HEAL_CD: 1 * 60 * 60,
};
