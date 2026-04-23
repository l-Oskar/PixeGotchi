import {
  useGetAllChests,
  useGetSortedChests,
} from "@/services/queries/chest.queries";
import { useInventoryStore } from "@/store/inventory.store";
import { ChestInventory } from "@shared";
import React from "react";

const ChestComponent: React.FC = () => {
  const { data: chests } = useGetAllChests();
  const { data: sortedChests } = useGetSortedChests();
  return (
    <>
      {sortedChests?.map((sortedChest: ChestInventory) => (
        <div key={sortedChest.chestType}>
          <div>
            <p>{sortedChest.chestType}</p>
            <p>{sortedChest.count}</p>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChestComponent;
