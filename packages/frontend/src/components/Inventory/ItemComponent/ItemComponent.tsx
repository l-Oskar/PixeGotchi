import ItemModal from "@/components/Inventory/ItemModal/ItemModal";
import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import {
  InventoryWithDetails,
  RARITY_BORDER_COLORS,
  RARITY_COLORS,
  RarityOrder,
} from "@pixegotchi/shared";
import { useEffect, useMemo, useState } from "react";
import SortedButtons from "./SortedButtons";
import { usePixegotchiActionFlow } from "@/hooks/usePixegotchi";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { canUseItemForStatus } from "@/utils/itemUsage";

export interface ItemComponentProps {
  sorted?: string;
}

const ItemComponent: React.FC<ItemComponentProps> = ({ sorted }) => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);
  const actionFlow = usePixegotchiActionFlow(
    currentPixegotchi?.status ?? null,
  );
  const currentStatus = currentPixegotchi?.status ?? null;
  const inventory = getInventory.data ?? [];
  const [sortedList, setSortedList] = useState<string>(sorted || "rarity");

  const currentInventoryItem = useMemo(
    () =>
      actionFlow.selectedItemId
        ? inventory.find((i) => i.itemId === actionFlow.selectedItemId)
        : null,
    [actionFlow.selectedItemId, inventory],
  );
  const currentItem = currentInventoryItem?.details ?? null;

  useEffect(() => {
    if (
      actionFlow.isModalOpen &&
      actionFlow.selectedItemId &&
      getInventory.isSuccess &&
      !currentInventoryItem
    ) {
      actionFlow.cancel();
    }
  }, [actionFlow, currentInventoryItem, getInventory.isSuccess]);

  const handleItemClick = (item: InventoryWithDetails) => {
    if (!canUseItemForStatus(item.details, currentStatus)) return;

    actionFlow.requestAction(item.itemId, currentStatus !== "active");
  };

  const handleUseItem = async (itemId: string, quantity: number) => {
    actionFlow.confirmAction(itemId, quantity);
    try {
      await useItem.mutateAsync({ itemId, quantity });
      actionFlow.mutationSucceeded();
    } catch (error) {
      actionFlow.mutationFailed(error);
      throw error;
    }
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
        {actionFlow.isBlocked && (
          <div className="pixel-panel-soft mb-3 px-3 py-2 font-pixel text-[8px] leading-4 text-yellow-100">
            Only revive items can be used while Pixegotchi is not active.
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {sortedInventory.map((item) => {
            const canUseItem = canUseItemForStatus(item.details, currentStatus);

            return (
              <button
                key={item.id}
                disabled={!canUseItem}
                onClick={() => handleItemClick(item)}
                className={`pixel-panel-soft ${RARITY_BORDER_COLORS[item.rarity]} group relative flex min-h-36 flex-col items-center justify-between gap-2 p-2 pt-4 transition hover:border-pixel-highlight/70 disabled:opacity-50`}>
                <span className="absolute right-1.5 top-1.5 min-w-6 rounded-sm border-2 border-pixel-border bg-pixel-surface-soft px-1.5 py-0.5 text-center font-pixel text-[8px] leading-3 text-pixel-ink">
                  {item.quantity}
                </span>
                <div className="mt-1 text-4xl leading-none transition group-hover:scale-110">
                  {item.details?.iconUrl ?? "?"}
                </div>
                <div className="line-clamp-2 min-h-8 text-center font-pixel text-[8px] leading-4 text-pixel-ink">
                  {item.details?.name ?? item.itemId}
                </div>
                <span
                  className={`rounded-sm border px-1.5 py-0.5 font-pixel text-[7px] uppercase leading-3 ${RARITY_BORDER_COLORS[item.rarity]} ${RARITY_COLORS[item.rarity]}`}>
                  {item.rarity}
                </span>
              </button>
            );
          })}
        </div>

        <ItemModal
          item={currentItem}
          quantity={currentInventoryItem?.quantity ?? 0}
          isOpen={actionFlow.isModalOpen}
          onClose={actionFlow.cancel}
          onUse={handleUseItem}
        />
      </div>
    </>
  );
};

export default ItemComponent;
