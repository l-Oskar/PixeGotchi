import { prisma } from "@/database/prisma";
import { getVaultStats } from "@/utils/vaultStats";

const httpError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export class VaultService {
  private async getVaultPixegotchis(userId: number) {
    const entries = await prisma.vault.findMany({
      where: {
        userId,
      },
      include: {
        pixegotchi: true,
      },
      orderBy: {
        storedAt: "desc",
      },
    });

    return entries.map((entry) => entry.pixegotchi);
  }

  async getStatsVault(userId: number) {
    const vaultPixe = await this.getVaultPixegotchis(userId);

    const stats = getVaultStats(vaultPixe);
    return stats;
  }

  async getAllVault(userId: number) {
    return await this.getVaultPixegotchis(userId);
  }

  async activateFromVault(userId: number, pixegotchiId: number) {
    return await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`
        SELECT "id"
        FROM "users"
        WHERE "id" = ${userId}
        FOR UPDATE
      `;

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { currentPixegotchiId: true },
      });

      if (!user) {
        throw httpError(404, "User not found");
      }

      if (user.currentPixegotchiId !== null) {
        throw httpError(409, "You already have a current Pixegotchi");
      }

      const vaultEntry = await tx.vault.findUnique({
        where: {
          userId_pixegotchiId: {
            userId,
            pixegotchiId,
          },
        },
        include: {
          pixegotchi: true,
        },
      });

      if (!vaultEntry || vaultEntry.pixegotchi.userId !== userId) {
        throw httpError(404, "Pixegotchi not found in your Vault");
      }

      if (vaultEntry.pixegotchi.status !== "vault") {
        throw httpError(
          409,
          `Pixegotchi with status ${vaultEntry.pixegotchi.status} cannot be activated from Vault`,
        );
      }

      const activatedPixegotchi = await tx.pixegotchi.update({
        where: { id: pixegotchiId },
        data: {
          status: "active",
          lastUpdateAt: new Date(),
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          currentPixegotchiId: pixegotchiId,
        },
      });

      await tx.vault.delete({
        where: {
          userId_pixegotchiId: {
            userId,
            pixegotchiId,
          },
        },
      });

      return activatedPixegotchi;
    });
  }
}
