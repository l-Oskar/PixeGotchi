import { useGetSortedChests } from "@/services/queries/chest.queries";
import ChestModal from "../ChestModal/ChestModal";
import {
  CHEST_TYPE_TO_RARITY,
  ChestInventory,
  ChestRewards,
  ChestType,
  ITEMS_IMG,
  RARITY_BORDER_COLORS,
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
        <div className="grid grid-cols-3 gap-3">
          {sortedChests?.map((sortedChest: ChestInventory) => (
            <button
              key={sortedChest.chestType}
              onClick={() => handleChestClick(sortedChest.chestType)}
              className={`bg-white/5 hover:bg-white/10 rounded-2xl p-4 border ${RARITY_BORDER_COLORS[CHEST_TYPE_TO_RARITY[sortedChest.chestType]]} transition flex flex-col items-center gap-2 group`}>
              <div className="text-4xl group-hover:scale-110 transition">
                {ITEMS_IMG.chest[sortedChest.chestType]}
              </div>
              <div className="text-xs font-medium text-center">
                {sortedChest.chestType}
              </div>
              <div className="text-xs text-white/60">
                {sortedChest.quantity}
              </div>
            </button>
          ))}
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
