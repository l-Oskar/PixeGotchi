import React, { useState } from "react";
import {
  Drumstick,
  Pill,
  Bubbles,
  Dices,
  Zap,
  Clover,
  Grid2X2,
} from "lucide-react";
import SortedButton from "./SortedButton";
import { ITEM_COLORS, ITEM_BG_COLORS } from "@pixegotchi/shared";
export interface SortedButtonsProps {
  initialFilter?: string;
  setFilter: (filter: string) => void;
}

const SortedButtons: React.FC<SortedButtonsProps> = ({
  initialFilter,
  setFilter,
}) => {
  const [active, setActive] = useState<string>(initialFilter || "rarity");
  const handleFilter = (filterValue: string) => {
    setFilter(filterValue);
    setActive(filterValue);
  };

  return (
    <div className="pixel-panel-soft mb-2 grid grid-cols-7 gap-1 p-1">
      <SortedButton
        active={active === "rarity"}
        filter="rarity"
        label="All"
        setFilter={handleFilter}
        icon={Grid2X2}
        bgColor="bg-gray-50/15"
      />
      <SortedButton
        active={active === "food"}
        filter="food"
        label="Food"
        setFilter={handleFilter}
        icon={Drumstick}
        color={ITEM_COLORS["food"]}
        bgColor={ITEM_BG_COLORS["food"]}
      />
      <SortedButton
        active={active === "medicine"}
        filter="medicine"
        label="Medical"
        setFilter={handleFilter}
        icon={Pill}
        color={ITEM_COLORS["medicine"]}
        bgColor={ITEM_BG_COLORS["medicine"]}
      />
      <SortedButton
        active={active === "cleaning"}
        filter="cleaning"
        label="Care"
        setFilter={handleFilter}
        icon={Bubbles}
        color={ITEM_COLORS["cleaning"]}
        bgColor={ITEM_BG_COLORS["cleaning"]}
      />
      <SortedButton
        active={active === "toy"}
        filter="toy"
        label="Fun"
        setFilter={handleFilter}
        icon={Dices}
        color={ITEM_COLORS["toy"]}
        bgColor={ITEM_BG_COLORS["toy"]}
      />
      <SortedButton
        active={active === "boost"}
        filter="boost"
        label="Boost"
        setFilter={handleFilter}
        icon={Zap}
        color={ITEM_COLORS["boost"]}
        bgColor={ITEM_BG_COLORS["boost"]}
      />
      <SortedButton
        active={active === "special"}
        filter="special"
        label="Special"
        setFilter={handleFilter}
        icon={Clover}
        color={ITEM_COLORS["special"]}
        bgColor={ITEM_BG_COLORS["special"]}
      />
    </div>
  );
};

export default SortedButtons;
