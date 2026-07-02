import { useGetSortedChests } from "@/services/queries/chest.queries";
import ChestModal from "../ChestModal/ChestModal";
import {
  CHEST_TYPE_TO_RARITY,
  ChestInventory,
  ChestRewards,
  ChestType,
  ITEMS_IMG,
  RARITY_BORDER_COLORS,
  RARITY_COLORS,
} from "@pixegotchi/shared";
import React, { useEffect, useMemo, useState } from "react";
import { useOpenChest } from "@/services/queries/inventory.queries";
import RewardModal from "../RewardsModal/RewardModal";

const ChestComponent: React.FC = () => {
  const [rewards, setRewards] = useState<ChestRewards | null>(null);
  const { data: sortedChestData } = useGetSortedChests();
  const openChest = useOpenChest();
  const sortedChests = useMemo(
    () => sortedChestData ?? [],
    [sortedChestData],
  );
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

  useEffect(() => {
    if (
      isModalOpen &&
      selectedChestType &&
      sortedChestData &&
      !currentChest
    ) {
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
          {sortedChests?.map((sortedChest: ChestInventory) => {
            const rarity = CHEST_TYPE_TO_RARITY[sortedChest.chestType];

            return (
              <button
                key={sortedChest.chestType}
                onClick={() => handleChestClick(sortedChest.chestType)}
                className={`pixel-panel-soft ${RARITY_BORDER_COLORS[rarity]} group relative flex min-h-36 flex-col items-center justify-between gap-2 p-2 pt-4 transition hover:border-pixel-highlight/70`}>
                <span className="absolute right-1.5 top-1.5 min-w-6 rounded-sm border-2 border-pixel-border bg-pixel-surface-soft px-1.5 py-0.5 text-center font-pixel text-[8px] leading-3 text-pixel-ink">
                  {sortedChest.quantity}
                </span>
                <div className="mt-1 text-4xl leading-none transition group-hover:scale-110">
                  {ITEMS_IMG.chest[sortedChest.chestType]}
                </div>
                <div className="line-clamp-2 min-h-8 text-center font-pixel text-[8px] leading-4 capitalize text-pixel-ink">
                  {sortedChest.chestType}
                </div>
                <span
                  className={`rounded-sm border px-1.5 py-0.5 font-pixel text-[7px] uppercase leading-3 ${RARITY_BORDER_COLORS[rarity]} ${RARITY_COLORS[rarity]}`}>
                  {rarity}
                </span>
              </button>
            );
          })}
        </div>

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
