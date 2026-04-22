import ItemModal from "@/components/Inventory/ItemModal/ItemModal";
import {
  useDetailedInventory,
  useUseItem,
} from "@/services/queries/inventory.queries";
import { useInventoryStore } from "@/store/inventory.store";
import { useEffect, useState } from "react";

const ChestComponent: React.FC = () => {
  const getInventory = useDetailedInventory();
  const useItem = useUseItem();
  const chests = useInventoryStore((s) => s.chests);

  const [selectedChest, setSelectedItem] = useState<{
    id: string;
    quantity: number;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentChest = selectedChest
    ? chests.find((i) => i.id === selectedChest.id)
    : null;
  useEffect(() => {}, [getInventory.data]);

  const handleItemClick = (id: string, quantity: number) => {
    setSelectedItem({ id, quantity });
    setIsModalOpen(true);
  };

  const handleUseItem = async (itemId: string, quantity: number) => {
    useItem.mutate({ itemId, quantity });
    setIsModalOpen(false);
  };

  return (
    <>
      <div>
        <div className="grid grid-cols-3 gap-3">
          {chests.map((chest) => (
            <button
              key={chest.id}
              onClick={() => handleItemClick(chest.id, chest.quantity)}
              className="bg-white/5 hover:bg-white/10 rounded-2xl p-4 border border-white/10 transition flex flex-col items-center gap-2 group">
              <div className="text-4xl group-hover:scale-110 transition">
                {chest.iconUrl}
              </div>
              <div className="text-xs font-medium text-center">
                {chest.name}
              </div>
              <div className="text-xs text-white/60">×{chest.quantity}</div>
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

export default ChestComponent;
