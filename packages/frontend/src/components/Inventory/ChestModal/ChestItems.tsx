import React from "react";
import { ChestPreview, RarityType } from "@shared";

export interface ChestPreviewProps {
  chestItems: ChestPreview[];
}

const ChestItems: React.FC<ChestPreviewProps> = ({ chestItems }) => {
  if (!chestItems || chestItems.length === 0) return null;

  const getRarityEmoji = (rarity: RarityType) => {
    const emojis = {
      common: "⚪️",
      uncommon: "🟢",
      rare: "🔵",
      epic: "🟣",
      mythic: "🟠",
      legendary: "🟡",
    };
    return emojis[rarity] || "⚪";
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
      {chestItems.map((item) => (
        <div
          key={item.itemId}
          className="group bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-all duration-200 cursor-pointer">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl">
                {getRarityEmoji(item.rarity)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {item.itemId.charAt(0).toUpperCase() + item.itemId.slice(1)}
                </p>
                <p className="text-white/40 text-xs capitalize">{item.type}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-white/80 text-sm font-mono">
                {item.probability}
              </p>
              <p className="text-white/40 text-xs capitalize">{item.rarity}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChestItems;
