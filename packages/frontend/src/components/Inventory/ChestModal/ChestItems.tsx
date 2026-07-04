import React, { useMemo } from "react";
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
  const groupedByRarity = useMemo(
    () =>
      chestItems.reduce(
        (groups, item) => {
          const rarity = item.rarity;
          if (!groups[rarity]) {
            groups[rarity] = [];
          }
          groups[rarity].push(item);
          return groups;
        },
        {} as Record<string, ChestPreview[]>,
      ),
    [chestItems],
  );
  const sortedRarities = useMemo(
    () =>
      Object.keys(groupedByRarity).sort(
        (a, b) => RarityOrder[a as RarityType] - RarityOrder[b as RarityType],
      ),
    [groupedByRarity],
  );

  if (!chest || chestItems.length === 0) return null;

  return (
    <div className="custom-scrollbar max-h-65 overflow-y-auto">
      {sortedRarities.map((rarity) => (
        <div key={rarity} className="mb-4">
          {/* Заголовок рідкості (опціонально) */}
          <div className="sticky top-0 z-10 mb-2 rounded-sm border border-pixel-border/50 bg-pixel-surface/95 px-2 py-1 shadow-[0_2px_0_var(--color-pixel-shadow)]">
            <span
              className={`font-pixel text-[8px] leading-3 ${RARITY_BORDER_COLORS[rarity].replace("border", "text")}`}>
              {`${rarity.toUpperCase()} - ${CHEST_CONFIG[chest.chestType as ChestType].item_rarity_distribution[rarity as RarityType]}%`}
            </span>
          </div>

          {/* Грід для елементів цієї рідкості */}
          <div className="grid grid-cols-3 gap-2">
            {groupedByRarity[rarity].map((item) => (
              <div
                key={item.itemId}
                className={`pixel-panel-soft cursor-pointer p-2 transition hover:border-pixel-highlight/70 ${RARITY_BORDER_COLORS[item.rarity]}`}>
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="pixel-icon-box h-10 w-10 text-xl">
                    {ITEMS_IMG[item.type]?.[item.itemId] || "📦"}
                  </div>
                  <p className="w-full truncate font-pixel text-[7px] leading-3 text-pixel-ink">
                    {item.itemId.charAt(0).toUpperCase() +
                      item.itemId.slice(1).split("_").join(" ")}
                  </p>
                  <p
                    className={`${ITEM_COLORS[item.type]} font-pixel text-[7px] leading-3 capitalize`}>
                    {item.type}
                  </p>
                  <div className="flex items-center justify-center">
                    <span className="font-pixel text-[7px] leading-3 text-pixel-muted">
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
