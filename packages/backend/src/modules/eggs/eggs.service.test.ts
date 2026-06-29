import { describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import { EggService } from "./eggs.service";
import { createEgg, createPixegotchi, createUser } from "@/test/helpers/factories";
import { EGG_CONSTANTS } from "@pixegotchi/shared";

describe("EggService", () => {
  it("creates an egg and deducts user balance transactionally", async () => {
    const user = await createUser({ pgcBalance: 250 });
    const eggService = new EggService();

    const egg = await eggService.createEgg(user.id);
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(egg.userId).toBe(user.id);
    expect(egg.pgcBalance).toBe("150");
    expect(updatedUser.pgcBalance.toString()).toBe("150");
  });

  it("rejects egg creation when balance is insufficient", async () => {
    const user = await createUser({ pgcBalance: 99 });
    const eggService = new EggService();

    await expect(eggService.createEgg(user.id)).rejects.toThrow(
      "Not enought funds",
    );
    await expect(prisma.egg.count({ where: { userId: user.id } })).resolves.toBe(
      0,
    );
  });

  it("does not start hatching for listed, hatched, or active-pet users", async () => {
    const eggService = new EggService();
    const listedUser = await createUser();
    const listedEgg = await createEgg(listedUser.id, { isListed: true });

    await expect(
      eggService.startHatching(listedUser.id, listedEgg.id),
    ).rejects.toThrow("listed in the market");

    const hatchedUser = await createUser();
    const hatchedEgg = await createEgg(hatchedUser.id, { isHatched: true });

    await expect(
      eggService.startHatching(hatchedUser.id, hatchedEgg.id),
    ).rejects.toThrow("Egg is hatched");

    const activeUser = await createUser();
    const activeEgg = await createEgg(activeUser.id);
    await createPixegotchi(activeUser.id);

    await expect(
      eggService.startHatching(activeUser.id, activeEgg.id),
    ).rejects.toThrow("active Pixegotchi");
  });

  it("hatches a ready egg into an active pixegotchi", async () => {
    const user = await createUser();
    const egg = await createEgg(user.id, {
      isHatching: true,
      hatchStartedAt: new Date(Date.now() - EGG_CONSTANTS.HATCHING_TIME - 1),
    });
    const eggService = new EggService();

    const pixegotchi = await eggService.hatchEgg(user.id, egg.id, "Readygo");
    const updatedEgg = await prisma.egg.findUniqueOrThrow({
      where: { id: egg.id },
    });

    expect(pixegotchi).toMatchObject({
      userId: user.id,
      eggId: egg.id,
      name: "Readygo",
      status: "active",
    });
    expect(updatedEgg.isHatched).toBe(true);
    expect(updatedEgg.isHatching).toBe(false);
  });

  it("rejects hatch before the egg is ready", async () => {
    const user = await createUser();
    const egg = await createEgg(user.id, {
      isHatching: true,
      hatchStartedAt: new Date(),
    });
    const eggService = new EggService();

    await expect(eggService.hatchEgg(user.id, egg.id)).rejects.toThrow(
      "Egg is not ready to hatch",
    );
  });
});
