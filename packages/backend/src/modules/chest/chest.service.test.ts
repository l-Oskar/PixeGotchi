import { describe, expect, it, vi } from "vitest";
import { ChestService } from "./chest.service";
import { createChest, createUser } from "@/test/helpers/factories";
import { ChestGenerator } from "@/utils/chest-generator";
import { ChestType, RarityType } from "@pixegotchi/shared";

describe("ChestService", () => {
  it("groups unopened chests by type and sorts them by shared chest order", async () => {
    const user = await createUser();
    const otherUser = await createUser();
    await createChest(user.id, { chestType: ChestType.golden });
    await createChest(user.id, { chestType: ChestType.wooden });
    await createChest(user.id, { chestType: ChestType.wooden });
    await createChest(user.id, { chestType: ChestType.silver, isOpened: true });
    await createChest(otherUser.id, { chestType: ChestType.legendary });
    const service = new ChestService();

    await expect(service.getSortedChests(user.id)).resolves.toEqual([
      { chestType: ChestType.wooden, quantity: 2 },
      { chestType: ChestType.golden, quantity: 1 },
    ]);
  });

  it("creates a random chest from the generator result", async () => {
    const user = await createUser();
    vi.spyOn(ChestGenerator, "generateRandomChest").mockReturnValue({
      chestType: ChestType.crystal,
      rarity: RarityType.epic,
    });
    const service = new ChestService();

    const chest = await service.getRandomChest(user.id);

    expect(chest).toMatchObject({
      userId: user.id,
      chestType: ChestType.crystal,
      isOpened: false,
    });
  });

  it("creates a specific chest from the requested type", async () => {
    const user = await createUser();
    const service = new ChestService();

    const chest = await service.getSpecificChest(user.id, ChestType.mythic);

    expect(chest).toMatchObject({
      userId: user.id,
      chestType: ChestType.mythic,
      isOpened: false,
    });
  });
});
