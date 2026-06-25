import React from "react";
import {
  ChestPreview,
  ChestInventory,
  ITEMS_IMG,
  RARITY_BORDER_COLORS,
  ITEM_COLORS,
  RarityOrder,
  RarityType,
  CHEST_CONFIG,
  ChestType,
} from "@pixegotchi/shared";

export interface ChestPreviewProps {
  chestItems: ChestPreview[];
  chest: ChestInventory | null;
}

const ChestItems: React.FC<ChestPreviewProps> = ({ chest, chestItems }) => {
  if (!chestItems || chestItems.length === 0) return null;

  // Групуємо елементи за рідкістю
  const groupedByRarity = chestItems.reduce(
    (groups, item) => {
      const rarity = item.rarity;
      if (!groups[rarity]) {
        groups[rarity] = [];
      }
      groups[rarity].push(item);
      return groups;
    },
    {} as Record<string, ChestPreview[]>,
  );

  // Отримуємо відсортовані рідкості
  const sortedRarities = Object.keys(groupedByRarity).sort(
    (a, b) => RarityOrder[a as RarityType] - RarityOrder[b as RarityType],
  );

  return (
    <div className="max-h-65 overflow-y-auto custom-scrollbar">
      {sortedRarities.map((rarity) => (
        <div key={rarity} className="mb-4">
          {/* Заголовок рідкості (опціонально) */}
          <div className="sticky top-0 bg-gray-800 backdrop-blur-sm z-10 px-2 py-1 mb-2 rounded">
            <span
              className={`text-xs font-bold ${RARITY_BORDER_COLORS[rarity].replace("border", "text")}`}>
              {`${rarity.toUpperCase()} - ${CHEST_CONFIG[chest!.chestType as ChestType].item_rarity_distribution[rarity as RarityType]}%`}
            </span>
          </div>

          {/* Грід для елементів цієї рідкості */}
          <div className="grid grid-cols-3 gap-2">
            {groupedByRarity[rarity].map((item) => (
              <div
                key={item.itemId}
                className={`border bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-200 cursor-pointer ${RARITY_BORDER_COLORS[item.rarity]}`}>
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                    {ITEMS_IMG[item.type]?.[item.itemId] || "📦"}
                  </div>
                  <p className="text-white font-medium text-xs truncate w-full">
                    {item.itemId.charAt(0).toUpperCase() +
                      item.itemId.slice(1).split("_").join(" ")}
                  </p>
                  <p
                    className={`${ITEM_COLORS[item.type]} text-[10px] capitalize`}>
                    {item.type}
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="text-white/60 text-[9px] font-mono">
                      {item.probability}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChestItems;
