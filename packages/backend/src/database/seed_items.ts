import { prisma } from "@/database/prisma";
import { ALL_ITEMS } from "@shared";

async function main() {
  console.log("🌱 Seeding database Items");

  await prisma.item.createMany({
    data: ALL_ITEMS as any,
  });
  console.log("✅ Seeding complete");
}
main()
  .catch((e) => {
    console.log("🛑 Errror seeding Items:", e), process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
