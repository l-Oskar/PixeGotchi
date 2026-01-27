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

  const pixegotchi = await prisma.pixegotchi.create({
    data: {
      userId: user.id,
      genomeHash:
        "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      name: "TestPet",
      status: "active",
      element: "fire",
      rarity: "rare",
      level: 5,
      experience: 250,
      health: 85,
      hunger: 40,
      energy: 60,
      happiness: 75,
      cleanliness: 90,
      hungerRate: 1.1,
      energyRate: 0.9,
      diseaseResistance: 1.2,
      hatchedAt: new Date(),
    },
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
