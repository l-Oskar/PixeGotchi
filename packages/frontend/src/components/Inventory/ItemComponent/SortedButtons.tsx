import React from "react";
import {
  Drumstick,
  Pill,
  Bubbles,
  Dices,
  Zap,
  ArrowDownAZ,
} from "lucide-react";

export interface SortedButtonsProps {
  setFilter: (string: string) => void;
}

const SortedButtons: React.FC<SortedButtonsProps> = ({ setFilter }) => {
  return (
    <div className="mb-2 flex justify-between">
      <button
        onClick={() => setFilter("rarity")}
        className="p-0.5 flex items-center border rounded-2xl">
        <ArrowDownAZ height={16} />
      </button>
      <button
        onClick={() => setFilter("food")}
        className="p-0.5 flex items-center border rounded-2xl bg-orange-500/20 text-orange-500">
        <Drumstick height={16} />
        <span className="pr-1.5">food</span>
      </button>
      <button
        onClick={() => setFilter("medicine")}
        className="p-0.5 flex items-center border rounded-2xl  bg-red-500/20 text-red-500">
        <Pill height={16} />
        <span className="pr-1.5">med</span>
      </button>
      <button
        onClick={() => setFilter("cleaning")}
        className="p-0.5 flex items-center border rounded-2xl bg-blue-500/20 text-blue-500">
        <Bubbles height={16} />
        <span className="pr-1.5">clean</span>
      </button>
      <button
        onClick={() => setFilter("toy")}
        className="p-0.5 flex items-center border rounded-2xl bg-pink-500/20 text-pink-500">
        <Dices height={16} />
        <span className="pr-1.5">toy</span>
      </button>
      <button
        onClick={() => setFilter("boost")}
        className="p-0.5 flex items-center border rounded-2xl bg-yellow-500/20 text-yellow-500">
        <Zap height={16} />
        <span className="pr-1.5">boost</span>
      </button>
    </div>
  );
};

export default SortedButtons;
