import ItemModal from "@/components/Inventory/ItemModal/ItemModal";
import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import {
  InventoryWithDetails,
  ITEM_BORDER_COLORS,
  ITEM_COLORS,
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
  searchQuery?: string;
  isFilterOpen: boolean;
}

const ItemComponent: React.FC<ItemComponentProps> = ({
  sorted,
  searchQuery = "",
  isFilterOpen,
}) => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const currentPixegotchi = usePixegotchiStore((s) => s.currentPixegotchi);
  const actionFlow = usePixegotchiActionFlow(currentPixegotchi?.status ?? null);
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
  const visibleInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return sortedInventory;

    return sortedInventory.filter((item) => {
      const searchableText = [
        item.details?.name,
        item.details?.description,
        item.itemId,
        item.itemType,
        item.rarity,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [searchQuery, sortedInventory]);

  return (
    <>
      <div>
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
            isFilterOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}>
          <div className="overflow-hidden">
            <SortedButtons
              initialFilter={sortedList}
              setFilter={setSortedList}
            />
          </div>
        </div>
        {actionFlow.isBlocked && (
          <div className="pixel-panel-soft mb-3 border-pixel-orange/70 px-3 py-2 font-pixel text-[8px] leading-4 text-pixel-orange">
            Only revive items can be used while Pixegotchi is critical.
          </div>
        )}
        <div className="grid grid-cols-3 gap-2">
          {visibleInventory.map((item) => {
            const canUseItem = canUseItemForStatus(item.details, currentStatus);
            const cannotUseWhileBlocked =
              currentStatus !== "active" && !canUseItem;

            return (
              <button
                key={item.id}
                aria-disabled={cannotUseWhileBlocked}
                onClick={() => handleItemClick(item)}
                className={`pixel-panel-soft ${RARITY_BORDER_COLORS[item.rarity]} group relative flex min-h-32 flex-col items-center justify-between gap-1.5 p-2 pt-3 transition hover:border-pixel-highlight/70 max-[380px]:min-h-30 ${
                  cannotUseWhileBlocked ? "opacity-70" : ""
                }`}>
                <span
                  className={`absolute left-1 top-1 rounded-md border px-1.5 py-0.5 font-pixel text-[6px] uppercase leading-3 ${RARITY_BORDER_COLORS[item.rarity]} ${RARITY_COLORS[item.rarity]}`}>
                  {item.rarity}
                </span>
                <span className="absolute right-1 top-1 min-w-6 rounded-md border border-pixel-border bg-pixel-surface-soft px-1.5 py-0.5 text-center font-pixel text-[8px] leading-3 text-pixel-ink">
                  {item.quantity}
                </span>
                <div className="mt-3 text-5xl leading-none transition group-hover:scale-110">
                  {item.details?.iconUrl ?? "?"}
                </div>
                <div className="line-clamp-2 min-h-4 text-center font-pixel text-[9px] leading-3 text-pixel-ink">
                  {item.details?.name ?? item.itemId}
                </div>
                <span
                  className={`rounded-md border px-1.5 py-0.5 font-pixel text-[6px] uppercase leading-3 ${ITEM_COLORS[item.itemType]} ${ITEM_BORDER_COLORS[item.itemType]}`}>
                  {item.itemType}
                </span>
              </button>
            );
          })}
        </div>
        {visibleInventory.length === 0 && (
          <div className="pixel-panel-soft mt-2 px-3 py-4 text-center font-pixel text-[8px] leading-4 text-pixel-muted">
            No items found
          </div>
        )}

        <ItemModal
          item={currentItem}
          quantity={currentInventoryItem?.quantity ?? 0}
          isOpen={actionFlow.isModalOpen}
          canUseItem={canUseItemForStatus(currentItem, currentStatus)}
          disabledReason={
            currentStatus === "critical"
              ? "Only revive items can be used while Pixegotchi is critical."
              : currentStatus
                ? `This item cannot be used while Pixegotchi is ${currentStatus}.`
                : undefined
          }
          onClose={actionFlow.cancel}
          onUse={handleUseItem}
        />
      </div>
    </>
  );
};

export default ItemComponent;
