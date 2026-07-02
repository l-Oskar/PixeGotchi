import { ChestRewards, ITEMS_IMG } from "@pixegotchi/shared";
import { motion, AnimatePresence } from "framer-motion";
import { RARITY_COLORS } from "@pixegotchi/shared";
import { X } from "lucide-react";
import React from "react";
import { getEggImg } from "@/utils/getImage";

export interface RewardModalProps {
  rewards: ChestRewards | null;
  isOpen: boolean;
  onClose: () => void;
}

const RewardModal: React.FC<RewardModalProps> = ({
  rewards,
  isOpen,
  onClose,
}) => {
  if (!rewards) return null;

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

          {/* Modal Container - центрування + pointer-events */}
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              className="pixel-panel mx-4 w-full max-w-sm p-4 pointer-events-auto"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header з кнопкою закриття (рекомендую додати) */}
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-pixel text-sm leading-5 text-pixel-ink">
                  Rewards
                </h2>
                <button
                  onClick={onClose}
                  className="pixel-button grid h-8 w-8 place-items-center p-0 text-pixel-muted hover:text-pixel-ink">
                  <X size={16} />
                </button>
              </div>

              {/* Контент нагород */}
              <div className="grid gap-3">
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {rewards.items.map((item) => (
                    <div
                      key={item.itemId}
                      className="pixel-panel-soft p-2">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="text-lg leading-none">
                            {ITEMS_IMG[item.type][item.itemId]}
                          </span>
                          <span className="font-pixel text-[8px] leading-4 text-pixel-ink">
                            {item.itemId.charAt(0).toUpperCase() +
                              item.itemId.slice(1).split("_").join(" ")}
                          </span>
                        </div>
                        <span
                          className={`font-pixel text-[7px] leading-3 ${RARITY_COLORS[item.rarity]}`}>
                          {item.rarity}
                        </span>
                      </div>
                      <div className="mt-1 font-pixel text-[7px] leading-3 text-pixel-muted">
                        {item.type}
                      </div>
                    </div>
                  ))}
                </div>
                {rewards?.egg && (
                  <div className="pixel-panel-soft flex justify-between p-2">
                    <div className="flex items-center gap-2 font-pixel text-[8px] leading-4 text-pixel-ink">
                      {<img className="w-5 h-6" src={getEggImg()} alt="egg" />}
                      Egg
                    </div>
                    <span className={`font-pixel text-[7px] leading-3 ${RARITY_COLORS.legendary}`}>
                      legendary
                    </span>
                  </div>
                )}
              </div>

              {/* Кнопка закриття (опціонально) */}
              <button
                onClick={onClose}
                className="pixel-button mt-4 w-full py-3 font-pixel text-[9px] leading-4 hover:scale-105">
                Close
              </button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RewardModal;
