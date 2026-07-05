import { useState } from "react";
import {
  Cooldowns,
  ELEMENT_COLORS,
  HomePageProps,
  RARITY_COLORS,
} from "@pixegotchi/shared";
import {
  Apple,
  Bubbles,
  CalendarDays,
  Flame,
  Gamepad2,
  Gift,
  Heart,
  Mars,
  Moon,
  MoreHorizontal,
  Pencil,
  Pill,
  Rocket,
  Smile,
  Sparkles,
  Venus,
  Zap,
  Droplets,
} from "lucide-react";
import CompactStat from "@/components/MainPage/CompactStat";
import ActionButton from "@/components/MainPage/ActionButton";
import { Visual } from "../MainPage/Visual";

export const ShowPixeGotchi: React.FC<HomePageProps> = ({
  pixegotchi,
  onNavigate,
}) => {
  const [cooldowns] = useState<Cooldowns>({
    feed: false,
    play: false,
    sleep: false,
    clean: false,
    heal: false,
  });

  const handleAction = (action: string) => {
    console.log(action);
  };

  if (!pixegotchi) return null;

  const experienceTarget = 1000;
  const experienceProgress = Math.min(
    100,
    Math.max(0, (pixegotchi.experience * 100) / experienceTarget),
  );
  const statusLabel = pixegotchi.status
    ? String(pixegotchi.status).replace(/_/g, " ")
    : "active";

  return (
    <div className="space-y-2 p-2.5">
      <section className="pixel-panel overflow-hidden bg-pixel-bg-deep/65 p-2 shadow-[0_5px_0_var(--color-pixel-shadow),0_0_0_2px_var(--color-pixel-border),inset_0_0_0_2px_var(--color-pixel-inset)]">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="truncate font-pixel text-[15px] leading-6 text-pixel-ink max-[380px]:text-sm">
                {pixegotchi.name ?? "Unknown"}
              </h2>
              <button
                type="button"
                aria-label="Edit Pixegotchi"
                className="shrink-0 text-pixel-border hover:text-pixel-highlight">
                <Pencil size={16} />
              </button>
            </div>
            <div className="mt-1.5 flex gap-1.5 overflow-x-auto pb-1 font-pixel">
              <span
                className={`rounded-sm border px-2 py-1 text-[7px] capitalize leading-3 ${RARITY_COLORS[pixegotchi.rarity]} whitespace-nowrap`}>
                {pixegotchi.rarity}
              </span>
              <span
                className={`rounded-sm border px-2 py-1 text-[7px] capitalize leading-3 ${ELEMENT_COLORS[pixegotchi.element]} whitespace-nowrap`}>
                {pixegotchi.element}
              </span>
              <span
                className={`rounded-sm border bg-pixel-bg-deep/50 px-2 py-1 text-[7px] leading-3 whitespace-nowrap ${pixegotchi.gender === "male" ? "border-pixel-blue text-pixel-blue" : "border-pixel-red text-pixel-red"}`}>
                <span className="flex items-center gap-1">
                  {pixegotchi.gender === "male" ? (
                    <Mars size={10} />
                  ) : (
                    <Venus size={10} />
                  )}
                  <span>
                    {pixegotchi.gender === "male" ? "Male" : "Female"}
                  </span>
                </span>
              </span>
            </div>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              className="pixel-icon-button h-9 min-h-9 w-9 min-w-9 text-pixel-red"
              aria-label="Favorite">
              <Heart size={16} fill="currentColor" />
            </button>
            <button
              type="button"
              onClick={() => {}}
              className="pixel-icon-button h-9 min-h-9 w-9 min-w-9 text-pixel-muted"
              aria-label="Pixegotchi details">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        <div className="relative min-h-[15.75rem] overflow-hidden max-[380px]:min-h-[15rem]">
          <div className="[&_.pixel-room-bg]:h-full [&_.pixel-room-bg]:min-h-[15.75rem] max-[380px]:[&_.pixel-room-bg]:min-h-[15rem]">
            <Visual pet={pixegotchi} status={null} />
          </div>
          <div className="pixel-panel-soft theme-soft-overlay absolute bottom-0 left-0 top-0 z-20 flex w-[45%] flex-col justify-center gap-2 border-pixel-border bg-pixel-bg-deep/90 p-2 shadow-[0_4px_0_var(--color-pixel-shadow),inset_0_0_0_2px_var(--color-pixel-inset-soft)] max-[380px]:bottom-2 max-[380px]:left-2 max-[380px]:top-2 max-[380px]:w-[46%] max-[380px]:gap-1.5">
            <CompactStat
              icon={Heart}
              label="Health"
              value={Number(pixegotchi.health)}
              bgColor="bg-pixel-red/15"
              strokeColor="text-pixel-red"
              rarity={pixegotchi.rarity}
              variant="row"
            />
            <CompactStat
              icon={Apple}
              label="Hunger"
              value={Number(pixegotchi.hunger)}
              bgColor="bg-pixel-orange/15"
              strokeColor="text-pixel-orange"
              rarity={pixegotchi.rarity}
              variant="row"
            />
            <CompactStat
              icon={Zap}
              label="Energy"
              value={Number(pixegotchi.energy)}
              bgColor="bg-pixel-highlight/15"
              strokeColor="text-pixel-highlight"
              rarity={pixegotchi.rarity}
              variant="row"
            />
            <CompactStat
              icon={Smile}
              label="Happiness"
              value={Number(pixegotchi.happiness)}
              bgColor="bg-pixel-red/15"
              strokeColor="text-pixel-red"
              rarity={pixegotchi.rarity}
              variant="row"
            />
            <CompactStat
              icon={Droplets}
              label="Cleanliness"
              value={Number(pixegotchi.cleanliness)}
              bgColor="bg-pixel-blue/15"
              strokeColor="text-pixel-blue"
              rarity={pixegotchi.rarity}
              variant="row"
            />
          </div>
        </div>
      </section>

      <section className="pixel-panel flex items-center gap-2 bg-pixel-bg-deep/75 p-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 grid grid-cols-[auto_1fr_auto] items-between gap-2 font-pixel text-[9px] leading-3 max-[380px]:gap-1.5 max-[380px]:text-[7px]">
            <span className="whitespace-nowrap text-pixel-border">
              Level {pixegotchi.level}
            </span>
            <span className="truncate text-center text-pixel-muted">
              {pixegotchi.experience} / {experienceTarget} EXP
            </span>
          </div>
          <div className="pixel-progress h-2.5 w-50">
            <div
              className="h-full bg-pixel-border shadow-[inset_0_0_0_1px_var(--color-pixel-inset)] transition-all duration-500"
              style={{ width: `${experienceProgress}%` }}
            />
          </div>
        </div>
        <span className="font-pixel text-[8px] whitespace-nowrap">
          Status:{" "}
          <span
            className={`${statusLabel === "dead" ? "text-pixel-red" : statusLabel === "critical" ? "text-pixel-orange" : "text-pixel-green"} capitalize`}>
            {statusLabel === "active" ? "Happy" : statusLabel}
          </span>
        </span>
        <button
          type="button"
          onClick={() => onNavigate("data")}
          className="pixel-icon-button hidden h-9 min-h-9 w-9 min-w-9 shrink-0 text-pixel-border min-[390px]:grid"
          aria-label="Pixegotchi details">
          <Smile size={16} />
        </button>
      </section>

      <section className="grid grid-cols-3 gap-2 max-[380px]:gap-1.5">
        <ActionButton
          icon={Apple}
          label="Feed"
          onClick={() => onNavigate("inventory", "food")}
          disabled={false}
          gradient="from-red-500 to-red-700"
        />
        <ActionButton
          icon={Pill}
          label="Heal"
          onClick={() => onNavigate("inventory", "medicine")}
          disabled={false}
          gradient="from-green-500 to-emerald-700"
        />
        <ActionButton
          icon={Bubbles}
          label="Clean"
          onClick={() => onNavigate("inventory", "cleaning")}
          disabled={cooldowns.clean}
          gradient="from-sky-500 to-blue-700"
        />
        <ActionButton
          icon={Gamepad2}
          label="Play"
          onClick={() => onNavigate("inventory", "toy")}
          disabled={false}
          gradient="from-purple-500 to-violet-800"
        />
        <ActionButton
          icon={Rocket}
          label="Boost"
          onClick={() => onNavigate("inventory", "boost")}
          gradient="from-orange-400 to-orange-700"
        />
        <ActionButton
          icon={Moon}
          label="Sleep"
          onClick={() => handleAction("sleep")}
          disabled={true}
          gradient="from-indigo-600 to-slate-800"
        />
      </section>

      <section className="grid grid-cols-2 gap-2 max-[380px]:gap-1.5">
        <div className="pixel-panel flex min-h-[4.75rem] items-center gap-2 bg-pixel-bg-deep/75 p-2">
          <span className="pixel-icon-box h-10 w-10 shrink-0 bg-pixel-surface-soft text-pixel-highlight">
            <Gift size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-pixel text-[7px] uppercase leading-3 text-pixel-border min-[430px]:text-[8px]">
              Daily Chest
            </div>
            <div className="mt-1 font-pixel text-[9px] leading-3 text-pixel-muted">
              0 / 10
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-sm border-2 border-pixel-bg-deep bg-pixel-bg-deep">
              <div className="h-full w-1/3 bg-pixel-highlight shadow-[inset_0_0_0_1px_var(--color-pixel-inset)]" />
            </div>
          </div>
          <button
            type="button"
            className="pixel-icon-button hidden h-7 min-h-7 w-7 min-w-7 text-pixel-border min-[390px]:grid"
            aria-label="Daily chest reward">
            <Gift size={14} />
          </button>
        </div>
        <div className="pixel-panel flex min-h-[4.75rem] items-center gap-2 bg-pixel-bg-deep/75 p-2">
          <span className="pixel-icon-box h-10 w-10 shrink-0 bg-pixel-surface-soft text-pixel-orange">
            <Flame size={21} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-pixel text-[7px] uppercase leading-3 text-pixel-border min-[430px]:text-[8px]">
              Streak
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-pixel text-[9px] leading-3 text-pixel-ink">
              <span>1 day</span>
              <Sparkles size={12} className="shrink-0 text-pixel-highlight" />
            </div>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 w-1.5 rounded-sm border border-pixel-bg-deep ${
                    index === 0 ? "bg-pixel-highlight" : "bg-pixel-surface"
                  }`}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="pixel-icon-button hidden h-7 min-h-7 w-7 min-w-7 text-pixel-muted min-[390px]:grid"
            aria-label="Streak calendar">
            <CalendarDays size={14} />
          </button>
        </div>
      </section>
    </div>
  );
};
