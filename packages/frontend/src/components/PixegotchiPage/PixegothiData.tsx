import React from "react";
import {
  calculateHourlyStatChanges,
  ELEMENT_COLORS,
  Pixegotchi,
  PixegotchiStats,
  RARITY_COLORS,
  RARITY_STATS,
  RarityType,
  TRAIT_EFFECTS,
  TraitEffectKey,
  TraitType,
} from "@pixegotchi/shared";
import {
  Heart,
  Apple,
  Zap,
  Smile,
  Droplets,
  LucideIcon,
  Mars,
  Venus,
} from "lucide-react";
import { formatWholeStatValue, toFiniteStatNumber } from "@/utils/formatStats";

interface PixegothiDataProps {
  pixegotchi: Pixegotchi | null;
}

const formatStatusDate = (value: Date | string | null) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TRAIT_EFFECT_LABELS: Record<TraitEffectKey, string> = {
  hunger_rate: "Hunger loss",
  energy_drain: "Energy recovery",
  game_energy_cost: "Game energy cost",
  game_pgc_gain: "Game PGC",
  game_chest_chance: "Game chest chance",
  happiness_gain: "Happiness gained",
  feed_happiness_gain: "Food happiness",
  play_happiness_gain: "Play happiness",
  cleanliness_decay: "Dirt buildup",
  health_resilience: "Health loss",
  play_requirement: "Happiness decay",
};

const POSITIVE_WHEN_INCREASED = new Set<TraitEffectKey>([
  "energy_drain",
  "happiness_gain",
  "feed_happiness_gain",
  "play_happiness_gain",
  "game_pgc_gain",
  "game_chest_chance",
]);

const getTraitDisplayEffects = (trait: TraitType) =>
  (
    Object.entries(TRAIT_EFFECTS[trait].effects) as Array<
      [TraitEffectKey, number]
    >
  ).map(([key, modifier]) => {
    const change =
      key === "health_resilience" || key === "energy_drain"
        ? (1 / modifier - 1) * 100
        : (modifier - 1) * 100;
    const isBenefit =
      key === "health_resilience"
        ? change < 0
        : POSITIVE_WHEN_INCREASED.has(key)
          ? change > 0
          : change < 0;

    return {
      key,
      label: TRAIT_EFFECT_LABELS[key],
      value: `${change > 0 ? "+" : ""}${Math.round(change)}%`,
      color: isBenefit ? "text-pixel-green" : "text-pixel-red",
    };
  });

const StatBar: React.FC<{
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: string;
  strokeColor: string;
  rarity: RarityType;
}> = ({ icon: Icon, label, value, color, strokeColor, rarity }) => {
  const numericValue = toFiniteStatNumber(value);
  const currentValue = Math.min(
    RARITY_STATS[rarity].maxStat,
    Math.max(0, numericValue),
  );
  const maxValue = RARITY_STATS[rarity].maxStat;
  const displayValue = formatWholeStatValue(currentValue);
  const percentage = (currentValue / maxValue) * 100;

  return (
    <div className="flex items-center gap-2">
      <div className="pixel-icon-box h-7 w-7 shrink-0">
        <Icon className={strokeColor} size={19} />
      </div>
      <div className="space-y-1 w-full">
        <div className="flex justify-between gap-2 font-pixel text-[8px] leading-3">
          <span className="text-pixel-muted">{label}</span>
          <div>
            <span
              className={
                currentValue === maxValue
                  ? "text-pixel-green"
                  : "text-pixel-yellow"
              }>
              {displayValue}
            </span>
            {" / "}
            <span className="text-pixel-green">{maxValue}</span>
          </div>
        </div>
        <div className="pixel-progress">
          <div
            className={`h-full ${color} transition-all duration-500 ease-out`}
            style={{ width: `${percentage}%` }}
          />
        </div>
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
    <div className="mt-1 font-pixel text-[9px] leading-3">{value}</div>
  </div>
);

const HOURLY_STAT_CONFIG: Array<{
  key: keyof PixegotchiStats;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "health", label: "Health", icon: Heart },
  { key: "hunger", label: "Hunger", icon: Apple },
  { key: "happiness", label: "Happiness", icon: Smile },
  { key: "cleanliness", label: "Cleanliness", icon: Droplets },
  { key: "energy", label: "Energy", icon: Zap },
];

const formatHourlyChange = (value: number) => {
  const roundedValue = Number(value.toFixed(2));
  return `${roundedValue > 0 ? "+" : ""}${roundedValue}`;
};

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

  const statusLabel = pixegotchi.status
    ? String(pixegotchi.status).replace(/_/g, " ")
    : "active";
  const statusKey = statusLabel.toLowerCase();
  const statusToneClass =
    statusKey === "dead"
      ? "text-[var(--status-critical)]"
      : statusKey === "critical"
        ? "text-[var(--status-critical)]"
        : statusKey === "sleeping"
          ? "text-[var(--status-sleeping)]"
          : statusKey === "hungry"
            ? "text-[var(--status-hungry)]"
            : statusKey === "dirty"
              ? "text-[var(--status-dirty)]"
              : statusKey === "sick"
                ? "text-[var(--status-sick)]"
                : "text-[var(--status-happy)]";
  const displayStatus = statusKey === "active" ? "Active" : statusLabel;
  const statusDate =
    statusKey === "critical"
      ? formatStatusDate(pixegotchi.criticalSince ?? pixegotchi.healthZeroAt)
      : statusKey === "dead"
        ? formatStatusDate(pixegotchi.criticalSince ?? pixegotchi.healthZeroAt)
        : statusKey === "vault"
          ? formatStatusDate(pixegotchi.lastUpdateAt)
          : null;
  const hourlyStatChanges = calculateHourlyStatChanges(pixegotchi);

  return (
    <div className="space-y-3 p-3">
      {/* Header */}
      <div className="pixel-panel p-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              <span
                className={`pixel-pill px-2 py-1 font-pixel text-[8px] leading-3 capitalize ${statusToneClass}`}>
                {displayStatus}
              </span>
              {statusDate && (
                <span className="font-pixel text-[7px] leading-3 text-pixel-muted">
                  since {statusDate}
                </span>
              )}
            </div>
            <h2 className="font-pixel text-md leading-5 text-pixel-ink">
              {pixegotchi.name}
            </h2>
            <p className="mt-1 font-pixel text-[8px] leading-3 text-pixel-muted">
              User ID: {`#${pixegotchi.userId}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right space-y-1">
              <div className="font-pixel text-[9px] leading-3 text-pixel-muted">
                Level
              </div>
              <div className="font-pixel text-md leading-5 text-pixel-highlight">
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
              ? "border-[var(--color-pixel-male)]/80 bg-[var(--color-pixel-male)]/15 text-[var(--color-pixel-male)]"
              : "border-[var(--color-pixel-female)]/70 bg-[var(--color-pixel-female)]/15 text-[var(--color-pixel-female)]"
          }
        />
      </div>

      {/* Stats */}
      <div className="pixel-panel space-y-3 p-3">
        <h3 className="font-pixel text-[12px] leading-4 text-pixel-ink">
          Stats
        </h3>
        <StatBar
          icon={Heart}
          label="Health"
          value={pixegotchi.health}
          color="bg-red-500"
          strokeColor="text-red-500"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          icon={Apple}
          label="Hunger"
          value={pixegotchi.hunger}
          color="bg-orange-500"
          strokeColor="text-orange-500"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          icon={Smile}
          label="Happiness"
          value={pixegotchi.happiness}
          color="bg-fuchsia-500"
          strokeColor="text-fuchsia-500"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          icon={Droplets}
          label="Cleanliness"
          value={pixegotchi.cleanliness}
          color="bg-sky-500"
          strokeColor="text-sky-500"
          rarity={pixegotchi.rarity}
        />
        <StatBar
          icon={Zap}
          label="Energy"
          value={pixegotchi.energy}
          color="bg-yellow-500"
          strokeColor="text-yellow-500"
          rarity={pixegotchi.rarity}
        />
      </div>

      {/* Hourly degradation */}
      <div className="pixel-panel p-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="font-pixel text-[12px] leading-4 text-pixel-ink">
            Degradation per hour
          </h3>
          <span className="font-pixel text-[7px] leading-3 text-pixel-muted">
            / 1H
          </span>
        </div>
        <p className="mb-3 font-pixel text-[7px] leading-4 text-pixel-muted">
          Includes level, rarity, traits, current stats and status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {HOURLY_STAT_CONFIG.map(({ key, label, icon: Icon }) => {
            const change = hourlyStatChanges[key];
            const changeColor =
              change > 0
                ? "text-pixel-green"
                : change < 0
                  ? "text-pixel-red"
                  : "text-pixel-muted";

            return (
              <div
                key={key}
                className="pixel-panel-soft flex items-center justify-between gap-2 p-2">
                <div className="flex min-w-0 items-center gap-2">
                  <Icon className="shrink-0 text-pixel-muted" size={15} />
                  <span className="truncate font-pixel text-[7px] leading-3 text-pixel-muted">
                    {label}
                  </span>
                </div>
                <span
                  className={`shrink-0 font-pixel text-[8px] leading-3 ${changeColor}`}>
                  {formatHourlyChange(change)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traits */}
      {pixegotchi.traits && pixegotchi.traits.length > 0 && (
        <div className="pixel-panel p-3">
          <h3 className="mb-3 font-pixel text-[12px] leading-4 text-pixel-ink">
            Traits
          </h3>
          <div className="grid gap-2">
            {pixegotchi.traits.map((trait) => {
              const traitConfig = TRAIT_EFFECTS[trait as TraitType];
              if (!traitConfig) return null;

              const effects = getTraitDisplayEffects(trait as TraitType);

              return (
                <div key={trait} className="pixel-panel-soft p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-pixel text-[9px] leading-3 text-pixel-blue">
                      {trait.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span
                      className={`font-pixel text-[7px] leading-3 uppercase ${RARITY_COLORS[traitConfig.rarity]}`}>
                      {traitConfig.rarity}
                    </span>
                  </div>
                  <p className="mt-1 font-pixel text-[7px] leading-4 text-pixel-muted">
                    {traitConfig.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-pixel text-[7px] leading-3">
                    {effects.map((effect) => (
                      <span key={effect.key} className={effect.color}>
                        {effect.label} {effect.value}
                      </span>
                    ))}
                    {traitConfig.special?.minimumHealth !== undefined && (
                      <span className="text-pixel-blue">
                        Minimum health {traitConfig.special.minimumHealth}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Meta Info */}
      <div className="pixel-panel p-3">
        <h3 className="mb-3 font-pixel text-[12px] leading-4 text-pixel-ink">
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
            <span className="text-pixel-muted">Pixegotchi ID</span>
            <span className="text-pixel-ink">
              {pixegotchi.id ? `#${pixegotchi.id}` : "N/A"}
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
