import { afterEach, describe, expect, it } from "vitest";
import { buildApp } from "@/app";
import { config } from "@/config/env";
import { prisma } from "@/database/prisma";
import { createUser } from "@/test/helpers/factories";

type TestApp = Awaited<ReturnType<typeof buildApp>>;

let app: TestApp | undefined;
const configuredAdminIds = new Set<string>();

const authHeaders = (instance: TestApp, userId: number) => ({
  authorization: `Bearer ${instance.jwt.sign({ userId })}`,
});

afterEach(async () => {
  await app?.close();
  app = undefined;
  for (const telegramId of configuredAdminIds) {
    config.adminTelegramIds.delete(telegramId);
  }
  configuredAdminIds.clear();
});

describe("marketplace treasury admin routes", () => {
  it("rejects an authenticated non-admin", async () => {
    const instance = await buildApp();
    app = instance;
    const user = await createUser();

    const response = await instance.inject({
      method: "GET",
      url: "/api/admin/marketplace/treasury",
      headers: authHeaders(instance, user.id),
    });

    expect(response.statusCode, response.body).toBe(403);
    expect(response.json()).toEqual({ error: "Forbidden" });
  });

  it("distributes treasury PGC and records the admin audit transaction", async () => {
    const adminTelegramId = "900001";
    config.adminTelegramIds.add(adminTelegramId);
    configuredAdminIds.add(adminTelegramId);
    const instance = await buildApp();
    app = instance;
    const admin = await createUser({
      telegramId: BigInt(adminTelegramId),
    });
    const recipient = await createUser({ pgcBalance: 10 });
    await prisma.marketplaceTreasuryBalance.update({
      where: { currency: "pgc" },
      data: { balance: 100 },
    });

    const response = await instance.inject({
      method: "POST",
      url: "/api/admin/marketplace/treasury/distribute",
      headers: authHeaders(instance, admin.id),
      payload: {
        userId: recipient.id,
        amount: "40",
        reason: "Community reward",
      },
    });

    expect(response.statusCode, response.body).toBe(201);
    expect(response.json()).toMatchObject({
      treasury: { currency: "pgc", balance: "60" },
      recipientPgcBalance: "50",
      transaction: {
        transactionType: "distribution",
        amount: "40",
        balanceAfter: "60",
        adminUserId: admin.id,
        recipientUserId: recipient.id,
        reason: "Community reward",
      },
    });

    const balanceResponse = await instance.inject({
      method: "GET",
      url: "/api/admin/marketplace/treasury",
      headers: authHeaders(instance, admin.id),
    });
    expect(balanceResponse.statusCode, balanceResponse.body).toBe(200);
    expect(balanceResponse.json()).toMatchObject({
      balances: [{ currency: "pgc", balance: "60" }],
    });

    const historyResponse = await instance.inject({
      method: "GET",
      url: "/api/admin/marketplace/treasury/transactions?limit=10",
      headers: authHeaders(instance, admin.id),
    });
    expect(historyResponse.statusCode, historyResponse.body).toBe(200);
    expect(historyResponse.json()).toMatchObject({
      transactions: [
        {
          transactionType: "distribution",
          amount: "40",
          recipientUserId: recipient.id,
        },
      ],
      nextCursor: null,
    });
  });

  it("rejects a treasury overdraft without crediting the recipient", async () => {
    const adminTelegramId = "900002";
    config.adminTelegramIds.add(adminTelegramId);
    configuredAdminIds.add(adminTelegramId);
    const instance = await buildApp();
    app = instance;
    const admin = await createUser({
      telegramId: BigInt(adminTelegramId),
    });
    const recipient = await createUser({ pgcBalance: 10 });
    await prisma.marketplaceTreasuryBalance.update({
      where: { currency: "pgc" },
      data: { balance: 25 },
    });

    const response = await instance.inject({
      method: "POST",
      url: "/api/admin/marketplace/treasury/distribute",
      headers: authHeaders(instance, admin.id),
      payload: {
        userId: recipient.id,
        amount: "40",
        reason: "Community reward",
      },
    });

    expect(response.statusCode, response.body).toBe(409);
    const unchangedRecipient = await prisma.user.findUniqueOrThrow({
      where: { id: recipient.id },
    });
    expect(unchangedRecipient.pgcBalance.toString()).toBe("10");
    await expect(
      prisma.marketplaceTreasuryTransaction.count({
        where: { transactionType: "distribution" },
      }),
    ).resolves.toBe(0);
  });
});
