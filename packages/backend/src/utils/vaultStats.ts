// utils/pixegotchiStats.ts
import { ElementType, RarityType, ElementStats, VaultStats } from "@shared";

// Порядок рідкості для порівняння
const RARITY_ORDER: Record<string, number> = {
  [RarityType.common]: 1,
  [RarityType.uncommon]: 2,
  [RarityType.rare]: 3,
  [RarityType.epic]: 4,
  [RarityType.mythic]: 5,
  [RarityType.legendary]: 6,
};

export function getVaultStats(pixegotchiList: any[]): ElementStats[] {
  // Створюємо базовий об'єкт з усіма елементами
  const stats: VaultStats = {} as VaultStats;

  // Ініціалізуємо всі елементи з ElementType
  Object.values(ElementType).forEach((element) => {
    stats[element as keyof VaultStats] = {
      element,
      count: 0,
      bestRarity: RarityType.common,
      highestLevel: 0,
      isEmpty: true,
    };
  });

  // Проходимо по всіх піксегочі
  pixegotchiList.forEach((p) => {
    const element = p.element as keyof VaultStats;
    const elementStats = stats[element];

    if (elementStats) {
      // Оновлюємо статистику
      elementStats.count++;
      elementStats.isEmpty = false;

      // Оновлюємо найвищий рівень
      const level = Number(p.level) || 0;
      if (level > elementStats.highestLevel) {
        elementStats.highestLevel = level;
      }

      // Оновлюємо найкращу рідкість
      const currentBestRank = RARITY_ORDER[elementStats.bestRarity] || 0;
      const newRarityRank = RARITY_ORDER[p.rarity] || 0;

      if (newRarityRank > currentBestRank) {
        elementStats.bestRarity = p.rarity;
      }
    }
  });

  return getVaultStatsArray(stats);
}

// Функція для отримання масиву елементів в правильному порядку
export function getVaultStatsArray(stats: VaultStats): ElementStats[] {
  return [
    stats.fire,
    stats.water,
    stats.earth,
    stats.air,
    stats.electric,
    stats.ice,
    stats.grass,
    stats.metal,
    stats.ghost,
    stats.poison,
    stats.psychic,
    stats.light,
    stats.dark,
    stats.rainbow,
  ];
}
