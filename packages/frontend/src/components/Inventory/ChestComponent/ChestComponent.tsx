import { useGetSortedChests } from "@/services/queries/chest.queries";
import { ChestInventory } from "@shared";
import React from "react";

const ChestComponent: React.FC = () => {
  const { data: sortedChests } = useGetSortedChests();
  return (
    <>
      {sortedChests?.map((sortedChest: ChestInventory) => (
        <div key={sortedChest.chestType}>
          <div>
            <p>{sortedChest.chestType}</p>
            <span>{sortedChest.count}</span>
          </div>
        </div>
      ))}
    </>
  );
};

export default ChestComponent;
