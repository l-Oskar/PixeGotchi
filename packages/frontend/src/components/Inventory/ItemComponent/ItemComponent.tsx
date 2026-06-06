import ItemModal from "@/components/Inventory/ItemModal/ItemModal";
import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import { useInventoryStore } from "@/store/inventory.store";
import {
  InventoryWithDetails,
  RARITY_BORDER_COLORS,
  RarityOrder,
} from "@shared";
import { useEffect, useState } from "react";
import SortedButtons from "./SortedButtons";

export interface ItemComponentProps {
  sorted?: string;
}

const ItemComponent: React.FC<ItemComponentProps> = ({ sorted }) => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const inventory = useInventoryStore((s) => s.detailedInventory);
  const [sortedList, setSortedList] = useState<string>(sorted || "rarity");

  const [selectedItem, setSelectedItem] = useState<{
    itemId: string;
    quantity: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentItem = selectedItem
    ? inventory.find((i) => i.itemId === selectedItem.itemId)?.details
    : null;
  useEffect(() => {}, [getInventory.data]);

  const handleItemClick = (itemId: string, quantity: number) => {
    setSelectedItem({ itemId, quantity });
    setIsModalOpen(true);
  };

  const handleUseItem = async (itemId: string, quantity: number) => {
    useItem.mutate({ itemId, quantity });
    setIsModalOpen(false);
  };

  const handleSortItems = (
    items: InventoryWithDetails[] | [],
    sortCase: string,
  ) => {
    let sortedItems;
    switch (sortCase) {
      case "rarity":
        sortedItems = items.sort((a, b) => {
          return RarityOrder[a.rarity] - RarityOrder[b.rarity];
        });
        break;
      case "rarity_r":
        sortedItems = items.sort((a, b) => {
          return RarityOrder[b.rarity] - RarityOrder[a.rarity];
        });
        break;
      case "food":
        sortedItems = items
          .filter((item) => item.itemType === "food")
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          });
        break;
      case "medicine":
        sortedItems = items
          .filter((item) => item.itemType === "medicine")
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          });
        break;
      case "toy":
        sortedItems = items
          .filter((item) => item.itemType === "toy")
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          });
        break;
      case "cleaning":
        sortedItems = items
          .filter((item) => item.itemType === "cleaning")
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          });
        break;
      case "boost":
        sortedItems = items
          .filter((item) => item.itemType === "boost")
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          });
        break;
      case "special":
        sortedItems = items
          .filter((item) => item.itemType === "special")
          .sort((a, b) => {
            return RarityOrder[a.rarity] - RarityOrder[b.rarity];
          });
        break;
      default:
        sortedItems = [...items];
        break;
    }
    return sortedItems;
  };

  return (
    <>
      <div>
        <SortedButtons setFilter={setSortedList} />
        <div className="grid grid-cols-3 gap-3">
          {handleSortItems(inventory, sortedList).map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.itemId, item.quantity)}
              className={`border ${RARITY_BORDER_COLORS[item.rarity]} bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition flex flex-col items-center gap-2 group`}>
              <div className="text-4xl group-hover:scale-110 transition">
                {item.details?.iconUrl}
              </div>
              <div className="text-xs font-medium text-center">
                {item.details!.name}
              </div>
              <div className="text-xs text-white/60">{item.quantity}</div>
            </button>
          ))}
        </div>

        <ItemModal
          item={currentItem!}
          quantity={selectedItem?.quantity ?? 0}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUse={handleUseItem}
        />
      </div>
    </>
  );
};

export default ItemComponent;
