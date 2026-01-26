import { prisma } from "@/database/prisma";

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { telegramId: BigInt(506295532) },
    update: {},
    create: {
      telegramId: BigInt(506295532),
      username: "admin_user",
      pgcBalance: 10000,
    },
  });

  console.log("Created user:", user);

  await prisma.inventory.createMany({
    data: [
      { userId: user.id, itemId: "apple", itemType: "food", quantity: 10 },
      {
        userId: user.id,
        itemId: "heal_potion",
        itemType: "medicine",
        quantity: 5,
      },
      { userId: user.id, itemId: "gold_chest", itemType: "chest", quantity: 2 },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.log(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
