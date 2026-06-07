import React from "react";
import {
  ChestPreview,
  ChestInventory,
  ITEMS_IMG,
  RARITY_BORDER_COLORS,
  ITEM_COLORS,
  RarityOrder,
} from "@shared";

export interface ChestPreviewProps {
  chestItems: ChestPreview[];
  chest: ChestInventory | null;
}

const ChestItems: React.FC<ChestPreviewProps> = ({ chest, chestItems }) => {
  if (!chestItems || chestItems.length === 0) return null;
  console.log(chest);
  console.log("Items", chestItems);
  return (
    <div className="max-h-65 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-3 gap-2">
        {chestItems
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          })
          .map((item) => (
            <div
              key={item.itemId}
              className={`border bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all duration-200 cursor-pointer ${RARITY_BORDER_COLORS[item.rarity]}`}>
              {/* Центруємо контент вертикально */}
              <div className="flex flex-col items-center text-center gap-1">
                {/* Іконка */}
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                  {ITEMS_IMG[item.type]?.[item.itemId] || "📦"}
                </div>

                {/* Назва */}
                <p className="text-white font-medium text-xs truncate w-full">
                  {item.itemId.charAt(0).toUpperCase() +
                    item.itemId.slice(1).split("_").join(" ")}
                </p>

                {/* Тип */}
                <p
                  className={`${ITEM_COLORS[item.type]} text-[10px] capitalize`}>
                  {item.type}
                </p>

                {/* Рідкість та шанс в один рядок */}
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
  );
};

export default ChestItems;
