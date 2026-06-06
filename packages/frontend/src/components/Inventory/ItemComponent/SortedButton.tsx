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
      className={`p-2 flex items-center rounded-2xl ${bgColor} ${color} ${active ? `border-2` : `border-2 border-transparent`}`}>
      <Icon height={18} />
    </button>
  );
};

export default SortedButton;
