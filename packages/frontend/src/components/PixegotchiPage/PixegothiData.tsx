import React from "react";
import { Pixegotchi, RARITY_COLORS, TRAIT_EFFECTS, TraitType } from "@shared";

interface PixegothiDataProps {
  pixegotchi: Pixegotchi | null;
}

const StatBar: React.FC<{
  label: string;
  value: number | string;
  color: string;
}> = ({ label, value, color }) => {
  const numericValue = typeof value === "number" ? value : 0;
  const percentage = Math.min(100, Math.max(0, numericValue));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="text-white font-medium">{numericValue}</span>
      </div>
      <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const InfoBadge: React.FC<{ label: string; value: string; color?: string }> = ({
  label,
  value,
  color = "bg-white/10 border-white/50 text-white",
}) => (
  <div className={`${color} border px-3 py-2 rounded-xl text-center`}>
    <div className="text-xs text-white/60 uppercase tracking-wider">
      {label}
    </div>
    <div className="text-sm font-semibold mt-0.5">{value}</div>
  </div>
);

const PixegothiData: React.FC<PixegothiDataProps> = ({ pixegotchi }) => {
  if (!pixegotchi) {
    return (
      <div className="p-4">
        <div className="min-h-96 bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm flex items-center justify-center">
          <div className="text-white/60 text-xl">No Pixegotchi found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{pixegotchi.name}</h2>
            <p className="text-white/60">ID #{pixegotchi.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-white/60 uppercase">Level</div>
              <div className="text-2xl font-bold text-white">
                {pixegotchi.level}
              </div>
            </div>
          </div>
        </div>

        {/* Experience bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/60">
            <span>Experience</span>
            <span>{pixegotchi.experience} / 1000 XP</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{
                width: `${(pixegotchi.experience * 100) / 1000}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      {/* <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm space-y-4">
        <h3 className="text-lg font-semibold text-white mb-3">Stats</h3>
        <StatBar
          label="❤️ Health"
          value={pixegotchi.health}
          color="bg-gradient-to-r from-red-400 to-red-600"
        />
        <StatBar
          label="🍖 Hunger"
          value={pixegotchi.hunger}
          color="bg-gradient-to-r from-orange-400 to-orange-600"
        />
        <StatBar
          label="⚡ Energy"
          value={pixegotchi.energy}
          color="bg-gradient-to-r from-yellow-400 to-yellow-600"
        />
        <StatBar
          label="😊 Happiness"
          value={pixegotchi.happiness}
          color="bg-gradient-to-r from-pink-400 to-pink-600"
        />
        <StatBar
          label="✨ Cleanliness"
          value={pixegotchi.cleanliness}
          color="bg-gradient-to-r from-cyan-400 to-cyan-600"
        />
      </div> */}

      {/* Info Grid */}
      <div className="grid grid-cols-3 gap-3">
        <InfoBadge
          label="Element"
          value={pixegotchi.element.toUpperCase()}
          color=""
        />
        <InfoBadge
          label="Rarity"
          value={pixegotchi.rarity.toUpperCase()}
          color={`${RARITY_COLORS[pixegotchi.rarity]}`}
        />
        <InfoBadge
          label="Gender"
          value={pixegotchi.gender === "male" ? "♂️ Male" : "♀️ Female"}
          color={
            pixegotchi.gender === "male"
              ? "bg-blue-500/15 border-blue-500/90"
              : "bg-pink-500/20 border-pink-500/80"
          }
        />
      </div>

      {/* Traits */}
      {pixegotchi.traits && pixegotchi.traits.length > 0 && (
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-white mb-3">Traits</h3>
          <div className="grid gap-2">
            {pixegotchi.traits.map((trait, index) => (
              <div className="flex items-baseline gap-1">
                <span
                  key={index}
                  className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-sm text-blue-300 font-medium">
                  {trait.toUpperCase()}
                </span>
                <p>- {TRAIT_EFFECTS[trait as TraitType].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-3">
          Meta Information
        </h3>
        <div className="space-y-2 text-sm">
          <div className="">
            <span className="text-white/60">Genome Hash: </span>
            <br />
            <span className="text-white font-mono text-xs">
              {pixegotchi.genomeHash}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Hatched At</span>
            <span className="text-white">
              {pixegotchi.hatchedAt
                ? new Date(pixegotchi.hatchedAt).toLocaleString()
                : "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Egg ID</span>
            <span className="text-white">
              {pixegotchi.eggId ? `#${pixegotchi.eggId}` : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PixegothiData;
