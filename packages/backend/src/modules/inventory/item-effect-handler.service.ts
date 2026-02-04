import { Pixegotchi } from "../../../generated/prisma/client";
import {
  ItemEffects,
  ItemEffectType,
  ItemEffectConfig,
} from "../../types/item-effects";

export class ItemEffectHandler {
  // Мапа ефектів до конфігурації
  private static effectConfig: Record<string, ItemEffectConfig> = {
    [ItemEffectType.RESTORE_HUNGER]: {
      field: "hunger",
      inverse: true,
      min: 0,
      max: 100,
    },
    [ItemEffectType.RESTORE_HEALTH]: {
      field: "health",
      min: 0,
      max: 100,
    },
    [ItemEffectType.RESTORE_ENERGY]: {
      field: "energy",
      min: 0,
      max: 100,
    },
    [ItemEffectType.RESTORE_HAPPINESS]: {
      field: "happiness",
      min: 0,
      max: 100,
    },
    [ItemEffectType.RESTORE_CLEANLINESS]: {
      field: "cleanliness",
      min: 0,
      max: 100,
    },
    [ItemEffectType.BOOST_EXPERIENCE]: {
      field: "experience",
      min: 0,
    },

    // Негативні ефекти
    [ItemEffectType.DRAIN_ENERGY]: {
      field: "energy",
      inverse: true,
      min: 0,
      max: 100,
    },
    [ItemEffectType.INCREASE_HUNGER]: {
      field: "hunger",
      min: 0,
      max: 100,
    },

    // Спеціальні (потребують кастомної логіки)
    [ItemEffectType.REVIVE]: { handler: "special" },
    [ItemEffectType.BOOST_ALL_STATS]: { handler: "special" },
    [ItemEffectType.RANDOM_STAT_BOOST]: { handler: "special" },
  };

  static applyEffects(
    pixegotchi: Pixegotchi,
    effects: ItemEffects,
    quantity: number = 1,
  ): Partial<Pixegotchi> {
    const updates: any = {
      lastUpdateAt: new Date(),
    };

    for (const [effectKey, value] of Object.entries(effects)) {
      if (value === undefined) continue;

      const config = this.effectConfig[effectKey];

      if (config?.handler === "special") {
        // Спеціальні ефекти обробляємо окремо
        this.applySpecialEffect(
          effectKey as ItemEffectType,
          pixegotchi,
          value,
          quantity,
          updates,
        );
      } else if (config?.field) {
        // Звичайні ефекти на стати
        this.applyStatEffect(config, pixegotchi, value, quantity, updates);
      } else {
        // Кастомні ефекти (логіка додається за потреби)
        console.warn(`Unknown effect: ${effectKey}`);
      }
    }

    // Перевірка на level up
    if (updates.experience !== undefined) {
      const newLevel = this.calculateLevel(updates.experience);
      if (newLevel > pixegotchi.level) {
        updates.level = newLevel;
      }
    }

    return updates;
  }

  private static applyStatEffect(
    config: ItemEffectConfig,
    pixegotchi: Pixegotchi,
    value: number,
    quantity: number,
    updates: any,
  ) {
    const field = config.field!;
    const currentValue = pixegotchi[field] as number;
    const change = (config.inverse ? -value : value) * quantity;
    let newValue = currentValue + change;

    // Застосування мін/макс обмежень
    if (config.min !== undefined) {
      newValue = Math.max(config.min, newValue);
    }
    if (config.max !== undefined) {
      newValue = Math.min(config.max, newValue);
    }

    updates[field] = newValue;
  }

  private static applySpecialEffect(
    effectType: ItemEffectType,
    pixegotchi: Pixegotchi,
    value: number,
    quantity: number,
    updates: any,
  ) {
    switch (effectType) {
      case ItemEffectType.REVIVE:
        if (pixegotchi.health === 0 && pixegotchi.lives > 0) {
          updates.health = value; // Відновлює здоров'я до вказаного значення
          updates.lives = pixegotchi.lives - 1;
        }
        break;

      case ItemEffectType.BOOST_ALL_STATS:
        const boost = value * quantity;
        updates.hunger = Math.max(0, pixegotchi.hunger - boost);
        updates.health = Math.min(100, pixegotchi.health + boost);
        updates.energy = Math.min(100, pixegotchi.energy + boost);
        updates.happiness = Math.min(100, pixegotchi.happiness + boost);
        updates.cleanliness = Math.min(100, pixegotchi.cleanliness + boost);
        break;

      case ItemEffectType.RANDOM_STAT_BOOST:
        const stats = ["health", "energy", "happiness", "cleanliness"];
        const randomStat = stats[Math.floor(Math.random() * stats.length)];
        const currentVal = pixegotchi[randomStat as keyof Pixegotchi] as number;
        updates[randomStat] = Math.min(100, currentVal + value * quantity);
        break;

      // Додавайте інші спеціальні ефекти тут
    }
  }

  private static calculateLevel(experience: number): number {
    // Приклад формули: кожні 100 XP = 1 рівень
    return Math.floor(experience / 100) + 1;
  }

  static getEffectDescription(effects: ItemEffects): string {
    const descriptions: string[] = [];

    for (const [key, value] of Object.entries(effects)) {
      if (value === undefined) continue;

      const config = this.effectConfig[key];

      if (config?.field) {
        const action = config.inverse ? "Reduces" : "Restores";
        const stat = config.field.replace(/([A-Z])/g, " $1").toLowerCase();
        descriptions.push(`${action} ${stat} by ${value}`);
      } else if (config?.handler === "special") {
        descriptions.push(
          this.getSpecialEffectDescription(key as ItemEffectType, value),
        );
      }
    }

    return descriptions.join(", ");
  }

  private static getSpecialEffectDescription(
    effect: ItemEffectType,
    value: number,
  ): string {
    switch (effect) {
      case ItemEffectType.REVIVE:
        return `Revives with ${value} HP`;
      case ItemEffectType.BOOST_ALL_STATS:
        return `Boosts all stats by ${value}`;
      case ItemEffectType.RANDOM_STAT_BOOST:
        return `Randomly boosts one stat by ${value}`;
      default:
        return `Special effect: ${effect}`;
    }
  }
}
