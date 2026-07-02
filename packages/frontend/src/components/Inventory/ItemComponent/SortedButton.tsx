import { LucideIcon } from "lucide-react";
import React from "react";

export interface SortedButtonsProps {
  setFilter: (filter: string) => void;
  filter: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  color?: string;
  bgColor?: string;
}

const SortedButton: React.FC<SortedButtonsProps> = ({
  setFilter,
  filter,
  label,
  icon: Icon,
  active,
  color,
  bgColor,
}) => {
  return (
    <button
      onClick={() => setFilter(filter)}
      aria-label={`Filter ${label}`}
      className={`grid min-w-0 grid-rows-[2.25rem_auto] place-items-center gap-0.5 rounded-sm border-2 p-1 transition ${bgColor} ${color} ${
        active
          ? "border-pixel-highlight text-pixel-highlight"
          : "border-transparent hover:border-pixel-border"
      }`}>
      <span className="grid h-8 w-8 place-items-center rounded-sm border-2 border-current/20 bg-pixel-bg-deep/30">
        <Icon size={16} />
      </span>
      <span className="max-w-full truncate font-pixel text-[6px] leading-3 text-current">
        {label}
      </span>
    </button>
  );
};

export default SortedButton;
