import { LucideIcon } from "lucide-react";
import React from "react";

export interface SortedButtonsProps {
  setFilter: (filter: string) => void;
  filter: string;
  icon: LucideIcon;
  active: boolean;
  color?: string;
  bgColor?: string;
}

const SortedButton: React.FC<SortedButtonsProps> = ({
  setFilter,
  filter,
  icon: Icon,
  active,
  color,
  bgColor,
}) => {
  return (
    <button
      onClick={() => setFilter(filter)}
      aria-label={`Filter ${filter}`}
      className={`grid min-h-9 place-items-center rounded-sm border-2 p-1 transition ${bgColor} ${color} ${
        active
          ? "border-pixel-highlight text-pixel-highlight"
          : "border-transparent hover:border-pixel-border"
      }`}>
      <Icon size={16} />
    </button>
  );
};

export default SortedButton;
