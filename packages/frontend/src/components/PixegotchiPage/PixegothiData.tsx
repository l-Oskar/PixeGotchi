import React from "react";
import {
  ELEMENT_COLORS,
  Pixegotchi,
  RARITY_COLORS,
  RARITY_STATS,
  RarityType,
  TRAIT_EFFECTS,
  TraitType,
} from "@pixegotchi/shared";
import { Mars, Venus } from "lucide-react";
import {
  formatWholeStatValue,
  toFiniteStatNumber,
} from "@/utils/formatStats";

interface PixegothiDataProps {
  pixegotchi: Pixegotchi | null;
}

const StatBar: React.FC<{
  label: string;
  value: number | string;
  color: string;
  rarity: RarityType;
}> = ({ label, value, color, rarity }) => {
  const numericValue = toFiniteStatNumber(value);
  const currentValue = Math.min(
    RARITY_STATS[rarity].maxStat,
    Math.max(0, numericValue),
  );
  const maxValue = RARITY_STATS[rarity].maxStat;
  const displayValue = formatWholeStatValue(currentValue);
  const percentage = (currentValue / maxValue) * 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 font-pixel text-[8px] leading-3">
        <span className="text-pixel-muted">{label}</span>
        <div>
          <span
            className={`${currentValue === maxValue ? "text-green-500" : "text-yellow-500"}`}>
            {displayValue}
          </span>
          {" / "}
          <span className="text-green-500">{maxValue}</span>
        </div>
      </div>
      <div className="pixel-progress">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const InfoBadge: React.FC<{
  label: string;
  value: any;
  color?: string;
}> = ({ label, value, color }) => (
  <div className={`pixel-panel-soft px-2 py-2 text-center ${color}`}>
    <div className="font-pixel text-[7px] leading-3 text-pixel-muted">
      {label}
    </div>
    <div className="mt-1 font-pixel text-[8px] leading-3">{value}</div>
  </div>
);

const PixegothiData: React.FC<PixegothiDataProps> = ({ pixegotchi }) => {
  if (!pixegotchi) {
    return (
      <div className="p-3">
        <div className="pixel-panel flex min-h-96 items-center justify-center p-4">
          <div className="font-pixel text-[10px] leading-4 text-pixel-muted">
            No Pixegotchi found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div className="pixel-panel p-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-pixel text-sm leading-5 text-pixel-ink">
              {pixegotchi.name}
            </h2>
            <p className="mt-1 font-pixel text-[8px] leading-3 text-pixel-muted">
              ID #{pixegotchi.id}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-pixel text-[7px] leading-3 text-pixel-muted">
                Level
              </div>
              <div className="font-pixel text-sm leading-5 text-pixel-highlight">
                {pixegotchi.level}
              </div>
            </div>
          </div>
        </div>

        {/* Experience bar */}
        <div className="space-y-1">
          <div className="flex justify-between gap-2 font-pixel text-[8px] leading-3 text-pixel-muted">
            <span>Experience</span>
            <span>{pixegotchi.experience} / 1000 XP</span>
          </div>
          <div className="pixel-progress">
            <div
              className="pixel-progress-fill transition-all duration-500"
              style={{
                width: `${(pixegotchi.experience * 100) / 1000}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-2">
        <InfoBadge
          label="Element"
          value={pixegotchi.element.toUpperCase()}
          color={`${ELEMENT_COLORS[pixegotchi.element]}`}
        />
        <InfoBadge
          label="Rarity"
          value={pixegotchi.rarity.toUpperCase()}
          color={`${RARITY_COLORS[pixegotchi.rarity]}`}
        />
        <InfoBadge
          label="Gender"
          value={
            pixegotchi.gender === "male" ? (
              <div className="flex gap-1 justify-center">
                <Mars size={12} />
                <span>MALE</span>
              </div>
            ) : (
              <div className="flex justify-center">
                <Venus size={12} />
                <span>FEMALE</span>
              </div>
            )
          }
          color={
            pixegotchi.gender === "male"
              ? "text-blue-500 bg-blue-500/15 border-blue-500/90"
              : "text-pink-400 bg-pink-500/20 border-pink-500/80"
          }
        />
      </div>

      {/* Stats */}
      <div className="pixel-panel space-y-3 p-3">
        <h3 className="font-pixel text-[10px] leading-4 text-pixel-ink">
          Stats
        </h3>
        <StatBar
          label="❤️ Health"
          value={pixegotchi.health}
          color="bg-gradient-to-r from-red-400 to-red-600"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          label="🍖 Hunger"
          value={pixegotchi.hunger}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          label="⚡ Energy"
          value={pixegotchi.energy}
          color="bg-gradient-to-r from-yellow-400 to-yellow-600"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          label="😊 Happiness"
          value={pixegotchi.happiness}
          color="bg-gradient-to-r from-pink-400 to-pink-600"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          label="✨ Cleanliness"
          value={pixegotchi.cleanliness}
          color="bg-gradient-to-r from-cyan-400 to-cyan-600"
          rarity={pixegotchi.rarity}
        />
      </div>

      {/* Traits */}
      {pixegotchi.traits && pixegotchi.traits.length > 0 && (
        <div className="pixel-panel p-3">
          <h3 className="mb-3 font-pixel text-[10px] leading-4 text-pixel-ink">
            Traits
          </h3>
          <div className="grid gap-2">
            {pixegotchi.traits.map((trait, index) => (
              <div key={index} className="pixel-panel-soft p-2">
                <span className="font-pixel text-[8px] leading-3 text-blue-300">
                  {trait.toUpperCase()}
                </span>
                <p className="mt-1 font-pixel text-[7px] leading-4 text-pixel-muted">
                  {TRAIT_EFFECTS[trait as TraitType].description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="pixel-panel p-3">
        <h3 className="mb-3 font-pixel text-[10px] leading-4 text-pixel-ink">
          Meta Information
        </h3>
        <div className="space-y-2 font-pixel text-[8px] leading-4">
          <div className="">
            <span className="text-pixel-muted">Genome Hash: </span>
            <br />
            <span className="break-all text-pixel-ink">
              {pixegotchi.genomeHash}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-pixel-muted">Hatched At</span>
            <span className="text-right text-pixel-ink">
              {pixegotchi.hatchedAt
                ? new Date(pixegotchi.hatchedAt).toLocaleString()
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-pixel-muted">Egg ID</span>
            <span className="text-pixel-ink">
              {pixegotchi.eggId ? `#${pixegotchi.eggId}` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixegothiData;
