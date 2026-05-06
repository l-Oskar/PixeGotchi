import {
  useGetAllChests,
  useGetSortedChests,
} from "@/services/queries/chest.queries";
import { useInventoryStore } from "@/store/inventory.store";
import ChestModal from "../ChestModal/ChestModal";
import { ChestInventory, ChestType, ITEMS_IMG } from "@shared";
import React, { useEffect, useState } from "react";
import { useOpenChest } from "@/services/queries/inventory.queries";

const ChestComponent: React.FC = () => {
  const [rewards, setRewards] = useState();
  const { data: sortedChestData } = useGetSortedChests();
  const { data: chestData } = useGetAllChests();
  const openChest = useOpenChest();
  const sortedChests = useInventoryStore((s) => s.sortedChests);
  const [selectedChest, setSelectedChest] = useState<ChestInventory | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentChest = selectedChest
    ? sortedChests?.find((chest) => chest.chestType === selectedChest.chestType)
    : null;

  useEffect(() => {}, [sortedChestData, chestData]);

  const handleChestClick = (chestType: ChestType, quantity: number) => {
    setSelectedChest({ chestType, quantity });
    setIsModalOpen(true);
  };

  const handleOpenChest = async (chestType: ChestType, quantity?: number) => {
    try {
      const reawards = await openChest.mutateAsync({ chestType, quantity });
      setRewards(reawards);
    } catch (error) {
      console.log(error);
    }
  };

  {
    if (!sortedChestData) return <>Loading</>;
  }
  return (
    <>
      <div>
        <div className="grid grid-cols-3 gap-3">
          {sortedChests?.map((sortedChest: ChestInventory) => (
            <button
              key={sortedChest.chestType}
              onClick={() =>
                handleChestClick(sortedChest.chestType, sortedChest.quantity)
              }
              className={
                "bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition flex flex-col items-center gap-2 group"
              }>
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
          chest={currentChest!}
          quantity={currentChest?.quantity ?? 0}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUse={handleOpenChest}
        />
      </div>
    </>
  );
};

export default ChestComponent;
