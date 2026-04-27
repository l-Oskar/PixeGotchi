import { useGetSortedChests } from "@/services/queries/chest.queries";
import { useInventoryStore } from "@/store/inventory.store";
import { ChestInventory } from "@shared";
import React from "react";

const ChestComponent: React.FC = () => {
  const { data } = useGetSortedChests();
  const sortedChests = useInventoryStore((s) => s.sortedChests);
  const chestStore = useInventoryStore((s) => s.chests);

  const handleChestClick = (chestType: string, chestQuantity: number) => {
    alert(`${chestType}: ${chestQuantity}`);
  };

  {
    if (!data) return <>Loading</>;
  }
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {sortedChests?.map((sortedChest: ChestInventory) => (
          <button
            key={sortedChest.chestType}
            onClick={() =>
              handleChestClick(sortedChest.chestType, sortedChest.quantity)
            }>
            <div>
              <div>
                <p>{sortedChest.chestType}</p>
                <span>{sortedChest.quantity}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </>
  );
};

export default ChestComponent;
