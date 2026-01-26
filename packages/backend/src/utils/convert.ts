import { Prisma } from "@prisma/client";

export function bigintToString<T>(value: T): T {
  if (typeof value === "bigint") return value.toString() as any;
  if (Array.isArray(value)) return value.map(bigintToString) as any;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, bigintToString(v)]),
    ) as any;
  }
  return value;
}

export function userProfileToResponse(user: any) {
  return {
    id: user.id,
    telegramId: user.telegramId?.toString() ?? null,
    walletAddress: user.walletAddress,
    username: user.username,

    // 🔥 Decimal → string
    pgcBalance:
      user.pgcBalance instanceof Prisma.Decimal
        ? user.pgcBalance.toString()
        : user.pgcBalance,

    createdAt:
      user.createdAt instanceof Date ? user.createdAt.toISOString() : null,

    updatedAt:
      user.updatedAt instanceof Date ? user.updatedAt.toISOString() : null,

    pixegotchis: user.pixegotchis.map((p: any) => ({
      id: p.id.toString(),
      name: p.name,
      level: p.level,
      status: p.status,
    })),

    inventory: user.inventory.map((i: any) => ({
      id: i.id.toString(),
      itemId: i.itemId,
      itemType: i.itemType,
      quantity: i.quantity,
      createdAt: i.createdAt instanceof Date ? i.createdAt.toISOString() : null,
    })),

    vault:
      user.vault?.map((v: any) => ({
        id: v.id.toString(),
        pixegotchis: v.pixegotchis.map((p: any) => ({
          id: p.id.toString(),
          name: p.name,
        })),
      })) ?? [],
  };
}
