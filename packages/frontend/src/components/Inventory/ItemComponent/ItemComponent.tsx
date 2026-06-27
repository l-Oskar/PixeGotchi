import ItemModal from "@/components/Inventory/ItemModal/ItemModal";
import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import {
  InventoryWithDetails,
  RARITY_BORDER_COLORS,
  RarityOrder,
} from "@pixegotchi/shared";
import { useEffect, useMemo, useState } from "react";
import SortedButtons from "./SortedButtons";

export interface ItemComponentProps {
  sorted?: string;
}

const ItemComponent: React.FC<ItemComponentProps> = ({ sorted }) => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const inventory = getInventory.data ?? [];
  const [sortedList, setSortedList] = useState<string>(sorted || "rarity");

  const [selectedItem, setSelectedItem] = useState<{
    itemId: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const currentInventoryItem = useMemo(
    () =>
      selectedItem
        ? inventory.find((i) => i.itemId === selectedItem.itemId)
        : null,
    [inventory, selectedItem],
  );
  const currentItem = currentInventoryItem?.details ?? null;

  useEffect(() => {
    if (
      isModalOpen &&
      selectedItem &&
      getInventory.isSuccess &&
      !currentInventoryItem
    ) {
      setIsModalOpen(false);
      setSelectedItem(null);
    }
  }, [currentInventoryItem, getInventory.isSuccess, isModalOpen, selectedItem]);

  const handleItemClick = (itemId: string) => {
    setSelectedItem({ itemId });
    setIsModalOpen(true);
  };

  const handleUseItem = async (itemId: string, quantity: number) => {
    await useItem.mutateAsync({ itemId, quantity });
  };

  const handleSortItems = (
    items: InventoryWithDetails[] | [],
    sortCase: string,
  ) => {
    let sortedItems;
    switch (sortCase) {
      case "rarity":
        sortedItems = [...items].sort((a, b) => {
          return RarityOrder[a.rarity] - RarityOrder[b.rarity];
        });
        break;
      case "rarity_r":
        sortedItems = [...items].sort((a, b) => {
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
  const sortedInventory = useMemo(
    () => handleSortItems(inventory, sortedList),
    [inventory, sortedList],
  );

  return (
    <>
      <div>
        <SortedButtons initialFilter={sortedList} setFilter={setSortedList} />
        <div className="grid grid-cols-3 gap-3">
          {sortedInventory.map((item) => (
            <button
              key={item.id}
              disabled={!item.details}
              onClick={() => handleItemClick(item.itemId)}
              className={`border ${RARITY_BORDER_COLORS[item.rarity]} bg-white/5 hover:bg-white/10 rounded-2xl p-4 transition flex flex-col items-center gap-2 group disabled:opacity-50 disabled:hover:bg-white/5`}>
              <div className="text-4xl group-hover:scale-110 transition">
                {item.details?.iconUrl ?? "?"}
              </div>
              <div className="text-xs font-medium text-center">
                {item.details?.name ?? item.itemId}
              </div>
              <div className="text-xs text-white/60">{item.quantity}</div>
            </button>
          ))}
        </div>

        <ItemModal
          item={currentItem}
          quantity={currentInventoryItem?.quantity ?? 0}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onUse={handleUseItem}
        />
      </div>
    </>
  );
};

export default ItemComponent;
