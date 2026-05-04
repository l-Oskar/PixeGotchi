import { ChestType, ItemType } from "../../enums";

export const ITEMS_IMG: Record<ItemType, Record<string | ChestType, string>> = {
  food: {
    apple: "🍎",
    cherry: "🍒",
  },
  cleaning: {
    water: "💧",
    soap: "🧼",
  },
  medicine: {
    pill: "💊",
    small_medicine: "💉",
  },
  toy: {
    small_toy: "🪀",
    rubber_ball: "☄️",
  },
  boost: {
    exp_booster: "📈",
    energy_drink: "🧋",
    energy_booster: "⚡️",
  },
  special: {
    rename_tag: "🏷",
    revive_stone: "💎",
    lucky_charm: "🍀",
  },
  chest: {
    wooden: "🪵",
    silver: "🪙",
    golden: "⚜️",
    crystal: "🔮",
    mythic: "🎁",
    legendary: "💠",
  },
};
