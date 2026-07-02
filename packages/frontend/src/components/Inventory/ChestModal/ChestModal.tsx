import {
  ChestType,
  ChestInventory,
  RARITY_COLORS,
  ITEMS_IMG,
} from "@pixegotchi/shared";
import { motion, AnimatePresence } from "framer-motion";
import { ChestGenerator } from "../../../../../backend/src/utils/chest-generator";
import ChestItems from "./ChestItems";
import { X, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";

export interface ChestModalProps {
  chest: ChestInventory | null;
  quantity: number;
  isOpen: boolean;
  onClose: () => void;
  onUse: (chestType: ChestType, quantity: number) => Promise<void>;
}

const ChestModal: React.FC<ChestModalProps> = ({
  chest,
  quantity,
  isOpen,
  onClose,
  onUse,
}) => {
  const [useQuantity] = useState(1);
  const [isUsing, setIsUsing] = useState(false);
  const [isItemPoolOpen, setIsItemPoolOpen] = useState(false);
  const chestDescription = useMemo(
    () =>
      chest
        ? ChestGenerator.getChestDescription(chest.chestType)
        : null,
    [chest],
  );
  const chestItems = useMemo(
    () =>
      chest
        ? ChestGenerator.getItemsWithProbabilities(chest.chestType)
        : [],
    [chest],
  );

  if (!chest || !chestDescription) return null;
  // const maxQuantity = item.isStackable ? (item.maxStack ?? quantity) : 1;
  const canUse = useQuantity >= 1 && useQuantity <= quantity && !isUsing;

  const handleUse = async () => {
    if (!canUse) return;
    setIsUsing(true);
    try {
      await onUse(chest.chestType, useQuantity);
      onClose();
    } catch (error) {
      console.error("Failed to use item:", error);
    } finally {
      setIsUsing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              className="pixel-panel mx-4 max-h-[88vh] w-full max-w-sm overflow-y-auto p-4 pointer-events-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="pixel-icon-box h-12 w-12 shrink-0 text-2xl">
                    {ITEMS_IMG.chest[chest.chestType]}
                  </div>
                  <div>
                    <h2 className="font-pixel text-sm leading-5 text-pixel-ink">
                      {`${chest.chestType.toUpperCase()} Chest`}
                    </h2>
                    <div className="mt-1 font-pixel text-[8px] leading-3 text-pixel-muted">
                      Rarity •{" "}
                      <span
                        className={`${RARITY_COLORS[chestDescription.rarity]}`}>
                        {chestDescription?.rarity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="pixel-button grid h-8 w-8 place-items-center p-0 text-pixel-muted hover:text-pixel-ink">
                  <X size={16} />
                </button>
              </div>

              {/* Description */}
              {chestDescription && (
                <div className="mb-4 grid gap-2 font-pixel text-[8px] leading-4 text-pixel-muted">
                  <p>
                    Egg chance:{" "}
                    <span className="text-[10px] text-pixel-ink">
                      {chestDescription.eggChance}%
                    </span>
                  </p>
                  <p>
                    Boost item chance:{" "}
                    <span className="text-[10px] text-pixel-ink">
                      {chestDescription.boostChance}%
                    </span>
                  </p>
                  <p>
                    Guaranteed items:{" "}
                    <span className="text-[10px] text-pixel-ink">
                      {chestDescription.guaranteed_items}
                    </span>
                  </p>

                  {/* Згортаний ItemPool */}
                  <div className="mt-2">
                    <button
                      onClick={() => setIsItemPoolOpen(!isItemPoolOpen)}
                      className="pixel-panel-soft flex w-full items-center justify-between p-2 transition hover:border-pixel-highlight/70">
                      <span className="font-pixel text-[8px] leading-3 text-pixel-ink">
                        Item Pool ({chestItems.length} items)
                      </span>
                      <motion.div
                        animate={{ rotate: isItemPoolOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}>
                        <ChevronDown
                          size={14}
                          className="text-pixel-muted"
                        />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isItemPoolOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden mt-2">
                          <ChestItems
                            chest={chest}
                            chestItems={chestItems}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Use Button */}
              <button
                onClick={handleUse}
                disabled={!canUse}
                className="pixel-button w-full bg-linear-to-br from-green-500 to-emerald-600 py-3 font-pixel text-[9px] leading-4 text-white hover:scale-105 disabled:bg-none disabled:text-pixel-muted disabled:hover:scale-100">
                {isUsing ? "Using..." : "Use item"}
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChestModal;
