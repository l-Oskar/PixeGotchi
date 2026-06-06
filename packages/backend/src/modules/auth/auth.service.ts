import crypto from "crypto";
import { config } from "@/config/env";
import { UserService } from "@/modules/users/users.service";
import { bLogger } from "@logger";
import { URLSearchParams } from "url";

export class AuthService {
  private userService = new UserService();

  async authenticateTelegram(initData: string) {
    if (config.nodeEnv !== "production") {
      bLogger.warn("⚠️ Telegram hash validation skipped (DEV MODE)");
      console.log("⚠️ Telegram hash validation skipped (DEV MODE)");
    } else {
      const isValid = this.validateTelegramInitData(initData);
      if (!isValid) {
        bLogger.error(new Error("Invalid telegram authentication data"));
        throw new Error("Invalid telegram authentication data");
      }
    }

    const userData = this.parseTelegramInitData(initData);

    const user = await this.userService.findOrCreate({
      telegramId: userData.id,
      username: userData.username,
    });

    return {
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        pgcBalance: user.pgcBalance.toString(),
        createdAt: user.createdAt,
      },
    };
  }

  async refreshToken(payload: { userId: number }) {
    return payload;
  }

  private validateTelegramInitData(initData: string): boolean {
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get("hash");
      urlParams.delete("hash");

      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");

      const secretKey = crypto
        .createHmac("sha256", "WebAppData")
        .update(config.telegramBotToken)
        .digest();

      const calculatedHash = crypto
        .createHmac("sha256", secretKey)
        .update(dataCheckString)
        .digest("hex");

      return calculatedHash === hash;
    } catch (err) {
      return false;
    }
  }

  private parseTelegramInitData(initData: string): {
    id: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  } {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get("user");

    if (!userParam) {
      throw new Error("User data not found in initData");
    }

    const user = JSON.parse(decodeURIComponent(userParam));
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
