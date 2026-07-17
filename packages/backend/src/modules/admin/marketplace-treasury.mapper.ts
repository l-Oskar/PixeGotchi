import type {
  MarketplaceTreasuryBalance,
  MarketplaceTreasuryTransaction,
} from "@pixegotchi/shared";
import type {
  MarketplaceTreasuryBalance as PrismaTreasuryBalance,
  MarketplaceTreasuryTransaction as PrismaTreasuryTransaction,
} from "@/generated/prisma/client";

export const mapMarketplaceTreasuryBalance = (
  balance: PrismaTreasuryBalance,
): MarketplaceTreasuryBalance => ({
  currency: balance.currency,
  balance: balance.balance.toString(),
  updatedAt: balance.updatedAt.toISOString(),
});

export const mapMarketplaceTreasuryTransaction = (
  transaction: PrismaTreasuryTransaction,
): MarketplaceTreasuryTransaction => ({
  id: transaction.id,
  transactionType: transaction.transactionType,
  currency: transaction.currency,
  amount: transaction.amount.toString(),
  balanceAfter: transaction.balanceAfter.toString(),
  purchaseId: transaction.purchaseId,
  adminUserId: transaction.adminUserId,
  recipientUserId: transaction.recipientUserId,
  reason: transaction.reason,
  createdAt: transaction.createdAt.toISOString(),
});
