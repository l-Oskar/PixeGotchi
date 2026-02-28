import { prisma } from "@/database/prisma";
import { getVaultStats } from "@/utils/vaultStats";
import { PixegotchiService } from "../pixegotchi/pixegotchi.service";

export class VaultService {
  private pixegotchi = new PixegotchiService();

  async getAllVault(userId: number) {
    const vaultPixe = await prisma.pixegotchi.findMany({
      where: {
        userId,
        status: "vault",
      },
    });
    if (!vaultPixe) throw new Error("Error vault");
    const stats = getVaultStats(vaultPixe);
    return stats;
  }
}
