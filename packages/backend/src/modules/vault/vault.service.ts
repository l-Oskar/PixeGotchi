import { prisma } from "@/database/prisma";
import { getVaultStats } from "@/utils/vaultStats";

export class VaultService {
  async getStatsVault(userId: number) {
    const vaultPixe = await prisma.pixegotchi.findMany({
      where: {
        userId,
        status: "vault",
      },
    });

    const stats = getVaultStats(vaultPixe);
    return stats;
  }

  async getAllVault(userId: number) {
    const vaultPixe = await prisma.pixegotchi.findMany({
      where: {
        userId,
        status: "vault",
      },
    });

    return vaultPixe;
  }
}
