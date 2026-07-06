import { afterEach, describe, expect, it } from "vitest";
import { prisma } from "@/database/prisma";
import { EggService } from "./eggs.service";
import {
  createEgg,
  createPixegotchi,
  createUser,
} from "@/test/helpers/factories";
import { EGG_CONSTANTS } from "@pixegotchi/shared";

describe("EggService", () => {
  const eggServices: EggService[] = [];

  function createEggService() {
    const eggService = new EggService();
    eggServices.push(eggService);
    return eggService;
  }

  afterEach(async () => {
    await Promise.all(eggServices.map((eggService) => eggService.close()));
    eggServices.length = 0;
  });

  it("creates an egg and deducts user balance transactionally", async () => {
    const user = await createUser({ pgcBalance: 1250 });
    const eggService = createEggService();

    const egg = await eggService.createEgg(user.id);
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(egg.userId).toBe(user.id);
    expect(egg.pgcBalance).toBe("250");
    expect(updatedUser.pgcBalance.toString()).toBe("250");
  });

  it("rejects egg creation when balance is insufficient", async () => {
    const user = await createUser({ pgcBalance: 99 });
    const eggService = createEggService();

    await expect(eggService.createEgg(user.id)).rejects.toThrow(
      "Not enought funds",
    );
    await expect(
      prisma.egg.count({ where: { userId: user.id } }),
    ).resolves.toBe(0);
  });

  it("does not start hatching for listed, hatched, or occupied-slot users", async () => {
    const eggService = createEggService();
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

    const criticalUser = await createUser();
    const criticalEgg = await createEgg(criticalUser.id);
    await createPixegotchi(criticalUser.id, { status: "critical" });

    await expect(
      eggService.startHatching(criticalUser.id, criticalEgg.id),
    ).rejects.toThrow("active Pixegotchi");

    const deadUser = await createUser();
    const deadEgg = await createEgg(deadUser.id);
    await createPixegotchi(deadUser.id, { status: "dead" });

    await expect(
      eggService.startHatching(deadUser.id, deadEgg.id),
    ).rejects.toThrow("active Pixegotchi");
  });

  it("hatches a ready egg into the current active pixegotchi", async () => {
    const user = await createUser();
    const egg = await createEgg(user.id, {
      isHatching: true,
      hatchStartedAt: new Date(Date.now() - EGG_CONSTANTS.HATCHING_TIME - 1),
    });
    const eggService = createEggService();

    const pixegotchi = await eggService.hatchEgg(user.id, egg.id, "Readygo");
    const updatedEgg = await prisma.egg.findUniqueOrThrow({
      where: { id: egg.id },
    });
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });

    expect(pixegotchi).toMatchObject({
      userId: user.id,
      eggId: egg.id,
      name: "Readygo",
      status: "active",
    });
    expect(updatedUser.currentPixegotchiId).toBe(pixegotchi.id);
    expect(updatedEgg.isHatched).toBe(true);
    expect(updatedEgg.isHatching).toBe(false);
  });

  it("rejects hatch before the egg is ready", async () => {
    const user = await createUser();
    const egg = await createEgg(user.id, {
      isHatching: true,
      hatchStartedAt: new Date(),
    });
    const eggService = createEggService();

    await expect(eggService.hatchEgg(user.id, egg.id)).rejects.toThrow(
      "Egg is not ready to hatch",
    );
  });

  it("processes tap batches and caps taps by max batch size", async () => {
    const user = await createUser();
    const egg = await createEgg(user.id, {
      isHatching: true,
      hatchStartedAt: new Date(),
      hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
      tapCount: 0,
    });
    const eggService = createEggService();

    const status = await eggService.proccessTapBatch(
      user.id,
      egg.id,
      EGG_CONSTANTS.EGG_MAX_BATCH_TAP + 10,
    );
    const updatedEgg = await prisma.egg.findUniqueOrThrow({
      where: { id: egg.id },
    });

    expect(updatedEgg.tapCount).toBe(EGG_CONSTANTS.EGG_MAX_BATCH_TAP);
    expect(status.tapCount).toBe(EGG_CONSTANTS.EGG_MAX_BATCH_TAP);
    expect(status.remainingTimeMs).toBe(0);
    expect(status.canHatchNow).toBe(true);
  });

  it("rate limits tap batches for the same egg and user", async () => {
    const user = await createUser();
    const egg = await createEgg(user.id, {
      isHatching: true,
      hatchStartedAt: new Date(),
      hatchingTimeMs: EGG_CONSTANTS.HATCHING_TIME,
    });
    const eggService = createEggService();

    await eggService.proccessTapBatch(user.id, egg.id, 1);

    await expect(
      eggService.proccessTapBatch(user.id, egg.id, 1),
    ).rejects.toThrow("Too many requests");
  });
});
