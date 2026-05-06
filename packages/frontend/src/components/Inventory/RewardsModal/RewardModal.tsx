import { ChestRewards, ITEMS_IMG } from "@shared";
import { motion, AnimatePresence } from "framer-motion";
import { RARITY_COLORS } from "@shared";
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
              className="bg-[#1a1a2e] rounded-3xl p-6 max-w-sm w-full mx-4 pointer-events-auto border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}>
              {/* Header з кнопкою закриття (рекомендую додати) */}
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Rewards</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition p-1">
                  <X size={24} />
                </button>
              </div>

              {/* Контент нагород */}
              <div className="grid gap-3">
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {rewards!.items.map((item) => (
                    <div
                      key={item.itemId}
                      className="bg-white/5 rounded-xl p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="font-medium">
                            {ITEMS_IMG[item.type][item.itemId]}
                          </span>
                          <span className="text-white font-medium">
                            {item.itemId.charAt(0).toUpperCase() +
                              item.itemId.slice(1).split("_").join(" ")}
                          </span>
                        </div>
                        <span
                          className={`text-sm ${RARITY_COLORS[item.rarity]}`}>
                          {item.rarity}
                        </span>
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        {item.type}
                      </div>
                    </div>
                  ))}
                </div>
                {rewards?.egg && (
                  <div className="flex justify-between bg-white/5 rounded-xl p-3">
                    <div className="flex gap-2">
                      {<img className="w-5 h-6" src={getEggImg()} alt="egg" />}
                      Egg
                    </div>
                    <span className={`${RARITY_COLORS.legendary}`}>
                      legendary
                    </span>
                  </div>
                )}
              </div>

              {/* Кнопка закриття (опціонально) */}
              <button
                onClick={onClose}
                className="w-full mt-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
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
