import { RARITY_STATS } from "@pixegotchi/shared";
import type { RarityType } from "@pixegotchi/shared";
import type { LucideIcon } from "lucide-react";
import { formatWholeStatValue, toFiniteStatNumber } from "@/utils/formatStats";

export interface CompactStatProps {
  icon: LucideIcon;
  label?: string;
  value: number;
  bgColor: string;
  strokeColor: string;
  rarity: RarityType;
  variant?: "compact" | "row";
}

const statFillClassByStroke: Record<string, string> = {
  "text-red-500": "bg-red-500",
  "text-orange-500": "bg-orange-500",
  "text-yellow-500": "bg-yellow-500",
  "text-pink-500": "bg-pink-500",
  "text-blue-500": "bg-blue-500",
  "text-fuchsia-500": "bg-fuchsia-500",
  "text-sky-500": "bg-sky-500",
  "text-pixel-red": "bg-pixel-red",
  "text-pixel-orange": "bg-pixel-orange",
  "text-pixel-yellow": "bg-pixel-yellow",
  "text-pixel-pink": "bg-pixel-pink",
  "text-pixel-highlight": "bg-pixel-highlight",
  "text-pixel-blue": "bg-pixel-blue",
  "text-pixel-green": "bg-pixel-green",
};

const CompactStat: React.FC<CompactStatProps> = ({
  icon: Icon,
  label,
  value,
  bgColor,
  strokeColor,
  rarity,
  variant = "compact",
}) => {
  const maxStats = RARITY_STATS[rarity].maxStat;
  const currentValue = Math.min(
    maxStats,
    Math.max(0, toFiniteStatNumber(value)),
  );
  const displayValue = formatWholeStatValue(currentValue);
  const progressPercent = (currentValue / maxStats) * 100;
  const fillColor = statFillClassByStroke[strokeColor] ?? "bg-pixel-highlight";

  if (variant === "row") {
    return (
      <div className="rounded-[0.5rem] border border-pixel-border/45 bg-pixel-surface-soft/55 p-1 shadow-[inset_0_1px_0_var(--color-pixel-inset-soft)]">
        <div className="mb-0.5 flex items-center gap-1">
          <div
            className={`pixel-icon-box h-5 w-5 shrink-0 max-[380px]:h-[1.125rem] max-[380px]:w-[1.125rem] ${bgColor}`}>
            <Icon
              size={12}
              strokeWidth={2.4}
              className={`${strokeColor} max-[380px]:h-2.5 max-[380px]:w-2.5`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1 font-pixel">
              <span className="truncate text-[6px] leading-3 text-pixel-muted">
                {label}
              </span>
              <span className="shrink-0 text-[6px] leading-3 text-pixel-ink">
                {displayValue}/{maxStats}
              </span>
            </div>
          </div>
        </div>
        <div className="pixel-progress h-1.5">
          <div
            className={`h-full ${fillColor} shadow-[inset_0_1px_0_var(--color-pixel-inset),0_0_8px_currentColor] transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    );
  }

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
