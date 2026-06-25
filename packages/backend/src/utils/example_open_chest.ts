// examples.ts

import { ChestGenerator } from "./chest-generator";
import { CHEST_DROP_RATES } from "@pixegotchi/shared";

// ============================================
// 1. DROP З ГРИ (випадковий chest)
// ============================================

function afterGameReward() {
  // Перевірка чи випав chest
  const chestDropped =
    Math.random() * 100 < CHEST_DROP_RATES.COMMON_RARE_CHANCE;

  if (chestDropped) {
    const chest = ChestGenerator.generateRandomChest();
    console.log("Chest dropped:", chest);
    // { chestType: 'golden', rarity: 'rare' }

    // Зберегти в БД
    // await prisma.chest.create({ data: { userId, chestType: chest.chestType }});
  } else {
    console.log("No chest dropped this time");
  }
}

// ============================================
// 2. QUEST ВИНАГОРОДА (конкретний chest)
// ============================================

function completeQuest() {
  // Quest дає гарантований Epic chest
  const chest = ChestGenerator.generateSpecificChest("crystal");
  console.log("Quest reward:", chest);
  // { chestType: 'crystal', rarity: 'epic' }

  // Зберегти в БД
  // await prisma.chest.create({ data: { userId, chestType: 'crystal' }});
}

// ============================================
// 3. ВІДКРИТТЯ CHEST
// ============================================

function openChest() {
  const rewards = ChestGenerator.openChest("golden");
  console.log("Chest rewards:", rewards);

  /*
  {
    items: [
      { itemId: 'sushi', type: 'food', quantity: 1, rarity: 'rare' },
      { itemId: 'vaccine', type: 'medicine', quantity: 1, rarity: 'rare' },
      { itemId: 'mega_boost', type: 'boost', quantity: 1, rarity: 'rare' }
    ],
    egg: false,
    totalValue: 150
  }
  */

  // Додати items в inventory
  // for (const item of rewards.items) {
  //   await prisma.inventory.upsert({...});
  // }

  // Створити egg якщо випав
  // if (rewards.egg) {
  //   await prisma.egg.create({ data: { userId }});
  // }
}

// ============================================
// 4. ВІДКРИТТЯ MYTHIC CHEST (з egg шансом)
// ============================================

function openMythicChest() {
  const rewards = ChestGenerator.openChest("mythic");
  console.log("Mythic chest rewards:", rewards);

  /*
  {
    items: [
      { itemId: 'ambrosia', type: 'food', quantity: 1, rarity: 'mythic' },
      { itemId: 'panacea', type: 'medicine', quantity: 1, rarity: 'mythic' },
      { itemId: 'cosmic_energy', type: 'boost', quantity: 1, rarity: 'mythic' }
    ],
    egg: true,  // 10% шанс!
    totalValue: 750
  }
  */
}

// ============================================
// 5. ПЕРЕВІРКА ЧИ МОЖНА ПРОДАТИ
// ============================================

function checkIfCanSell() {
  console.log("Wooden sellable?", ChestGenerator.canSellChest("wooden")); // false
  console.log("Mythic sellable?", ChestGenerator.canSellChest("mythic")); // true
  console.log("Legendary sellable?", ChestGenerator.canSellChest("legendary")); // true
}

// ============================================
// 6. ОПИС CHEST
// ============================================

function getDescription() {
  const desc = ChestGenerator.getChestDescription("crystal");
  console.log(desc);

  /*
  CRYSTAL Chest (epic)
  Guaranteed: 2 items
  Boost chance: 40%
  Egg chance: 5%
  */
}

// ============================================
// 7. СТАТИСТИКА (1000 відкриттів)
// ============================================

function statistics() {
  const results = {
    totalValue: 0,
    itemsByRarity: {} as Record<string, number>,
    eggsDropped: 0,
  };

  for (let i = 0; i < 1000; i++) {
    const rewards = ChestGenerator.openChest("legendary");

    results.totalValue += rewards.totalValue;

    if (rewards.egg) {
      results.eggsDropped++;
    }

    rewards.items.forEach((item) => {
      results.itemsByRarity[item.rarity] =
        (results.itemsByRarity[item.rarity] || 0) + 1;
    });
  }

  console.log("Statistics from 1000 Legendary chests:");
  console.log("Average value:", results.totalValue / 1000);
  console.log("Items by rarity:", results.itemsByRarity);
  console.log(
    "Eggs dropped:",
    results.eggsDropped,
    `(${((results.eggsDropped / 1000) * 100).toFixed(1)}%)`,
  );

  /*
  Statistics from 1000 Legendary chests:
  Average value: 425
  Items by rarity: { legendary: 700, mythic: 500, epic: 500, rare: 300 }
  Eggs dropped: 203 (20.3%)
  */
}

// ============================================
// 8. МАСОВА ГЕНЕРАЦІЯ (gacha simulation)
// ============================================

function massGeneration() {
  const chests = Array.from({ length: 100 }, () =>
    ChestGenerator.generateRandomChest(),
  );

  const distribution = chests.reduce(
    (acc, chest) => {
      acc[chest.chestType] = (acc[chest.chestType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log("100 random chests distribution:");
  console.log(distribution);

  /*
  100 random chests distribution:
  {
    wooden: 45,
    silver: 24,
    golden: 16,
    crystal: 10,
    mythic: 4,
    legendary: 1
  }
  */
}
