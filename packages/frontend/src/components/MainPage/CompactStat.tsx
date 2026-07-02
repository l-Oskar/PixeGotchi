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

const statFillClassByStroke: Record<string, string> = {
  "text-red-500": "bg-red-500",
  "text-orange-500": "bg-orange-500",
  "text-yellow-500": "bg-yellow-500",
  "text-pink-500": "bg-pink-500",
  "text-blue-500": "bg-blue-500",
};

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
  const progressPercent = (currentValue / maxStats) * 100;
  const fillColor = statFillClassByStroke[strokeColor] ?? "bg-pixel-highlight";

  return (
    <div className="pixel-panel-soft flex min-w-0 flex-col items-center gap-1 p-1">
      <div className={`pixel-icon-box h-7 w-7 ${bgColor}`}>
        <Icon size={14} className={strokeColor} />
      </div>
      <div className="font-pixel text-[8px] leading-3 text-pixel-ink">
        {displayValue}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-sm bg-pixel-bg-deep">
        <div
          className={`h-full ${fillColor} transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className="font-pixel text-[7px] leading-3 text-pixel-muted">
        {maxStats}
      </div>
    </div>
  );
};

export default CompactStat;
