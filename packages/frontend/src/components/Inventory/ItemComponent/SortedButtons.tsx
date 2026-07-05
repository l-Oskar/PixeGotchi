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
export interface SortedButtonsProps {
  initialFilter?: string;
  setFilter: (filter: string) => void;
}

const itemFilterTheme = {
  food: {
    color: "text-pixel-orange",
    bgColor: "bg-pixel-orange/15",
  },
  medicine: {
    color: "text-pixel-red",
    bgColor: "bg-pixel-red/15",
  },
  cleaning: {
    color: "text-pixel-blue",
    bgColor: "bg-pixel-blue/15",
  },
  toy: {
    color: "text-pixel-highlight",
    bgColor: "bg-pixel-highlight/15",
  },
  boost: {
    color: "text-pixel-orange",
    bgColor: "bg-pixel-orange/15",
  },
  special: {
    color: "text-pixel-green",
    bgColor: "bg-pixel-green/15",
  },
} as const;

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
        color="text-pixel-muted"
        bgColor="bg-pixel-surface/50"
      />
      <SortedButton
        active={active === "food"}
        filter="food"
        label="Food"
        setFilter={handleFilter}
        icon={Drumstick}
        color={itemFilterTheme.food.color}
        bgColor={itemFilterTheme.food.bgColor}
      />
      <SortedButton
        active={active === "medicine"}
        filter="medicine"
        label="Medical"
        setFilter={handleFilter}
        icon={Pill}
        color={itemFilterTheme.medicine.color}
        bgColor={itemFilterTheme.medicine.bgColor}
      />
      <SortedButton
        active={active === "cleaning"}
        filter="cleaning"
        label="Care"
        setFilter={handleFilter}
        icon={Bubbles}
        color={itemFilterTheme.cleaning.color}
        bgColor={itemFilterTheme.cleaning.bgColor}
      />
      <SortedButton
        active={active === "toy"}
        filter="toy"
        label="Fun"
        setFilter={handleFilter}
        icon={Dices}
        color={itemFilterTheme.toy.color}
        bgColor={itemFilterTheme.toy.bgColor}
      />
      <SortedButton
        active={active === "boost"}
        filter="boost"
        label="Boost"
        setFilter={handleFilter}
        icon={Zap}
        color={itemFilterTheme.boost.color}
        bgColor={itemFilterTheme.boost.bgColor}
      />
      <SortedButton
        active={active === "special"}
        filter="special"
        label="Special"
        setFilter={handleFilter}
        icon={Clover}
        color={itemFilterTheme.special.color}
        bgColor={itemFilterTheme.special.bgColor}
      />
    </div>
  );
};

export default SortedButtons;
