import {
  useGetAllChests,
  useGetSortedChests,
} from "@/services/queries/chest.queries";
import { useInventoryStore } from "@/store/inventory.store";
import ChestModal from "../ChestModal/ChestModal";
import { ChestInventory, ChestType } from "@shared";
import React, { useEffect, useState } from "react";

const chestIMG: Record<ChestType, string> = {
  wooden: "🪵",
  silver: "🪙",
  golden: "⚜️",
  crystal: "🔮",
  mythic: "🎁",
  legendary: "💠",
};

const ChestComponent: React.FC = () => {
  const { data: sortedChestData } = useGetSortedChests();
  const { data: chestData } = useGetAllChests();
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

  const handleUseItem = async (chestType: ChestType, quantity: number) => {
    alert("Open");
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
                {chestIMG[sortedChest.chestType]}
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
          onUse={handleUseItem}
        />
      </div>
    </>
  );
};

export default ChestComponent;
