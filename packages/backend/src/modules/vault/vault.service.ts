import { prisma } from "@/database/prisma";
import { getVaultStats } from "@/utils/vaultStats";

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

  // async getFromVault(userId: number, pixegothiId: number) {
  //   const activePixegotchi = await prisma.pixegotchi.findFirst()
  // }
}
