import { RARITY_STATS, RarityType } from "@pixegotchi/shared";
import { LucideIcon } from "lucide-react";
import {
  formatWholeStatValue,
  toFiniteStatNumber,
} from "@/utils/formatStats";

export interface CompactStatProps {
  icon: LucideIcon;
  value: number;
  bgColor: string;
  strokeColor: string;
  rarity: RarityType;
}

const CompactStat: React.FC<CompactStatProps> = ({
  icon: Icon,
  value,
  bgColor,
  strokeColor,
  rarity,
}) => {
  const maxStats = RARITY_STATS[rarity].maxStat;
  const currentValue = Math.min(maxStats, Math.max(0, toFiniteStatNumber(value)));
  const displayValue = formatWholeStatValue(currentValue);
  const circumference = 2 * Math.PI * 16; // radius = 16
  const strokeDashoffset =
    circumference - (currentValue / maxStats) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-10 h-10">
        {/* Background circle */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/10"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${strokeColor} transition-all duration-500`}
          />
        </svg>
        {/* Icon in center */}
        <div
          className={`absolute inset-0 ${bgColor} rounded-xl flex items-center justify-center`}>
          <Icon size={16} className={strokeColor} />
        </div>
      </div>
      <div className="text-[10px] font-semibold text-white/80">{`${displayValue} / ${maxStats}`}</div>
    </div>
  );
};

export default CompactStat;
