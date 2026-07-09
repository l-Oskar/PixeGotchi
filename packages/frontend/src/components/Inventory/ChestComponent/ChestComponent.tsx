import { useGetSortedChests } from "@/services/queries/chest.queries";
import ChestModal from "../ChestModal/ChestModal";
import {
  CHEST_TYPE_TO_RARITY,
  ChestInventory,
  ChestRewards,
  ChestType,
  RARITY_BORDER_COLORS,
  RARITY_COLORS,
} from "@pixegotchi/shared";
import React, { useEffect, useMemo, useState } from "react";
import { useOpenChest } from "@/services/queries/inventory.queries";
import RewardModal from "../RewardsModal/RewardModal";
import { getChestImg } from "@/utils/getImage";

export interface ChestComponentProps {
  searchQuery?: string;
}

const ChestComponent: React.FC<ChestComponentProps> = ({
  searchQuery = "",
}) => {
  const [rewards, setRewards] = useState<ChestRewards | null>(null);
  const { data: sortedChestData } = useGetSortedChests();
  const openChest = useOpenChest();
  const sortedChests = useMemo(() => sortedChestData ?? [], [sortedChestData]);
  const [selectedChestType, setSelectedChestType] = useState<ChestType | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const currentChest = useMemo(
    () =>
      selectedChestType
        ? (sortedChests.find(
            (chest) => chest.chestType === selectedChestType,
          ) ?? null)
        : null,
    [selectedChestType, sortedChests],
  );
  const visibleChests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return sortedChests;

    return sortedChests.filter((chest) => {
      const rarity = CHEST_TYPE_TO_RARITY[chest.chestType];
      const searchableText = [chest.chestType, rarity].join(" ").toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, sortedChests]);

  useEffect(() => {
    if (isModalOpen && selectedChestType && sortedChestData && !currentChest) {
      setIsModalOpen(false);
      setSelectedChestType(null);
    }
  }, [currentChest, isModalOpen, selectedChestType, sortedChestData]);

  const handleChestClick = (chestType: ChestType) => {
    setSelectedChestType(chestType);
    setIsModalOpen(true);
  };

  const handleOpenChest = async (chestType: ChestType, quantity?: number) => {
    try {
      const rewards = await openChest.mutateAsync({ chestType, quantity });
      setRewards(rewards);
      setIsRewardsModalOpen(true);
    } catch (error) {
      console.error("Failed to open chest:", error);
    }
  };

  // {
  //   if (!sortedChestData) return <>Loading</>;
  // }
  return (
    <>
      <div>
        <div className="grid grid-cols-3 gap-2">
          {visibleChests.map((sortedChest: ChestInventory) => {
            const rarity = CHEST_TYPE_TO_RARITY[sortedChest.chestType];
            const chestImage = getChestImg(sortedChest.chestType);

            return (
              <button
                key={sortedChest.chestType}
                onClick={() => handleChestClick(sortedChest.chestType)}
                className={`pixel-panel-soft ${RARITY_BORDER_COLORS[rarity]} group relative flex min-h-[8rem] flex-col items-center justify-between gap-1.5 p-2 pt-3 transition hover:border-pixel-highlight/70 max-[380px]:min-h-[10.5rem]`}>
                <span
                  className={`absolute left-1 top-1 rounded-md border px-1.5 py-0.5 font-pixel text-[6px] uppercase leading-3 ${RARITY_BORDER_COLORS[rarity]} ${RARITY_COLORS[rarity]}`}>
                  {rarity}
                </span>
                <span className="absolute right-1 top-1 min-w-6 rounded-md border border-pixel-border bg-pixel-surface-soft px-1.5 py-0.5 text-center font-pixel text-[8px] leading-3 text-pixel-ink">
                  {sortedChest.quantity}
                </span>
                <div
                  className="mt-1 transition group-hover:scale-110"
                  role="img"
                  aria-label={`${sortedChest.chestType} chest`}
                  style={{
                    backgroundImage: `url("./${chestImage.src}")`,
                    backgroundPosition: chestImage.backgroundPosition,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: chestImage.backgroundSize,
                    height: chestImage.size,
                    imageRendering: "pixelated",
                    width: chestImage.size,
                  }}
                />
                <div className="line-clamp-2 min-h-4 text-center font-pixel text-[9px] leading-3 capitalize text-pixel-ink">
                  {sortedChest.chestType}
                </div>
              </button>
            );
          })}
        </div>
        {visibleChests.length === 0 && (
          <div className="pixel-panel-soft mt-2 px-3 py-4 text-center font-pixel text-[8px] leading-4 text-pixel-muted">
            No chests found
          </div>
        )}

        <ChestModal
          chest={currentChest}
          quantity={currentChest?.quantity ?? 0}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedChestType(null);
          }}
          onUse={handleOpenChest}
        />

        <RewardModal
          rewards={rewards}
          isOpen={isRewardsModalOpen}
          onClose={() => {
            setIsRewardsModalOpen(false);
            setRewards(null);
          }}
        />
      </div>
    </>
  );
};

export default ChestComponent;
