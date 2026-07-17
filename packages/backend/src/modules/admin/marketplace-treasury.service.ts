import type {
  DistributeMarketplaceTreasuryInput,
  DistributeMarketplaceTreasuryResponse,
  MarketplaceTreasuryBalancesResponse,
  MarketplaceTreasuryTransactionsResponse,
} from "@pixegotchi/shared";
import { prisma } from "@/database/prisma";
import { Prisma } from "@/generated/prisma/client";
import {
  mapMarketplaceTreasuryBalance,
  mapMarketplaceTreasuryTransaction,
} from "./marketplace-treasury.mapper";

const MAX_DECIMAL_20_8 = new Prisma.Decimal("999999999999.99999999");

const treasuryError = (statusCode: number, message: string) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const parseDistributionAmount = (rawAmount: string) => {
  let amount: Prisma.Decimal;
  try {
    amount = new Prisma.Decimal(rawAmount);
  } catch {
    throw treasuryError(400, "Invalid distribution amount");
  }

  if (
    !amount.isFinite() ||
    amount.decimalPlaces() > 8 ||
    amount.lessThanOrEqualTo(0) ||
    amount.greaterThan(MAX_DECIMAL_20_8)
  ) {
    throw treasuryError(400, "Invalid distribution amount");
  }

  return amount;
};

const lockUser = async (
  transaction: Prisma.TransactionClient,
  userId: number,
) => {
  const users = await transaction.$queryRaw<Array<{ id: number }>>`
    SELECT "id"
    FROM "users"
    WHERE "id" = ${userId}
    FOR UPDATE
  `;
  if (users.length !== 1) {
    throw treasuryError(404, "User not found");
  }
};

const lockTreasury = async (
  transaction: Prisma.TransactionClient,
  currency: "pgc",
) => {
  const balances = await transaction.$queryRaw<Array<{ currency: string }>>`
    SELECT "currency"
    FROM "marketplace_treasury_balances"
    WHERE "currency" = ${currency}::"CurrencyType"
    FOR UPDATE
  `;
  if (balances.length !== 1) {
    throw treasuryError(409, "Marketplace treasury is not initialized");
  }
};

export class MarketplaceTreasuryService {
  async getBalances(): Promise<MarketplaceTreasuryBalancesResponse> {
    const balances = await prisma.marketplaceTreasuryBalance.findMany({
      orderBy: { currency: "asc" },
    });

    return {
      balances: balances.map(mapMarketplaceTreasuryBalance),
    };
  }

  async getTransactions(
    limit: number,
    cursor?: number,
  ): Promise<MarketplaceTreasuryTransactionsResponse> {
    const transactions =
      await prisma.marketplaceTreasuryTransaction.findMany({
        where: cursor ? { id: { lt: cursor } } : undefined,
        orderBy: { id: "desc" },
        take: limit + 1,
      });
    const hasMore = transactions.length > limit;
    const page = hasMore ? transactions.slice(0, limit) : transactions;

    return {
      transactions: page.map(mapMarketplaceTreasuryTransaction),
      nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
    };
  }

  async distribute(
    adminUserId: number,
    input: DistributeMarketplaceTreasuryInput,
  ): Promise<DistributeMarketplaceTreasuryResponse> {
    const amount = parseDistributionAmount(input.amount);

    return prisma.$transaction(
      async (transaction) => {
        const userIds = [...new Set([adminUserId, input.userId])].sort(
          (left, right) => left - right,
        );
        for (const userId of userIds) {
          await lockUser(transaction, userId);
        }
        await lockTreasury(transaction, "pgc");

        const debited = await transaction.marketplaceTreasuryBalance.updateMany({
          where: {
            currency: "pgc",
            balance: { gte: amount },
          },
          data: { balance: { decrement: amount } },
        });
        if (debited.count !== 1) {
          throw treasuryError(409, "Insufficient marketplace treasury balance");
        }

        const credited = await transaction.user.updateMany({
          where: {
            id: input.userId,
            pgcBalance: { lte: MAX_DECIMAL_20_8.minus(amount) },
          },
          data: { pgcBalance: { increment: amount } },
        });
        if (credited.count !== 1) {
          throw treasuryError(409, "Recipient PGC balance limit exceeded");
        }
        const recipient = await transaction.user.findUniqueOrThrow({
          where: { id: input.userId },
          select: { pgcBalance: true },
        });
        const treasury =
          await transaction.marketplaceTreasuryBalance.findUniqueOrThrow({
            where: { currency: "pgc" },
          });
        const treasuryTransaction =
          await transaction.marketplaceTreasuryTransaction.create({
            data: {
              transactionType: "distribution",
              currency: "pgc",
              amount,
              balanceAfter: treasury.balance,
              adminUserId,
              recipientUserId: input.userId,
              reason: input.reason,
            },
          });

        return {
          treasury: mapMarketplaceTreasuryBalance(treasury),
          recipientPgcBalance: recipient.pgcBalance.toString(),
          transaction: mapMarketplaceTreasuryTransaction(treasuryTransaction),
        };
      },
      { isolationLevel: "Serializable" },
    );
  }
}
