import { useState } from "react";
import {
  Cooldowns,
  ELEMENT_COLORS,
  HomePageProps,
  RARITY_COLORS,
} from "@pixegotchi/shared";
import {
  Heart,
  Gamepad2,
  Bubbles,
  Apple,
  Pill,
  Moon,
  Zap,
  Smile,
  Droplets,
  Menu,
  Mars,
  Venus,
  Rocket,
  Gift,
  Flame,
  Activity,
} from "lucide-react";
import CompactStat from "@/components/MainPage/CompactStat";
import ActionButton from "@/components/MainPage/ActionButton";
import { Visual } from "../MainPage/Visual";
import QuickInfo from "../Other/QuickInfo";

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

  // const handleAction = (action: keyof Cooldowns) => {
  //   setCooldowns((prev) => ({ ...prev, [action]: true }));
  //   setTimeout(() => {
  //     setCooldowns((prev) => ({ ...prev, [action]: false }));
  //   }, 3000);
  // };
  const handleAction = (action: string) => {
    console.log(action);
  };

  // const handleSetToVault = () => {
  //   setPixegotchiToVault.mutateAsync();
  //   clearPixegotchi();
  //   setActive(null);
  //   onNavigate("start");
  // };

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
      <div className="p-3 space-y-3">
        {/* Pixegotchi Card */}
        <div className="pixel-panel p-3">
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex justify-between">
              <h2 className="font-pixel text-base leading-6 flex items-center gap-2">
                {pixegotchi.name ?? "Unknown"}
              </h2>
              <button
                onClick={() => onNavigate("data")}
                className="text-pixel-muted hover:text-pixel-ink">
                <Menu size={20} />
              </button>
            </div>
            <div className="flex gap-2 py-1">
              <div className="flex justify-between flex-1 gap-1.5 overflow-x-auto font-pixel">
                <span
                  className={`text-[9px] px-2 py-1 ${RARITY_COLORS[pixegotchi.rarity]} rounded-sm border capitalize whitespace-nowrap`}>
                  {pixegotchi.rarity}
                </span>
                <span
                  className={`text-[9px] px-2 py-1 ${ELEMENT_COLORS[pixegotchi.element]} rounded-sm border capitalize whitespace-nowrap`}>
                  {pixegotchi.element}
                </span>
                <span
                  className={`text-[9px] px-2 py-1 bg-amber-200/20 rounded-sm border whitespace-nowrap ${pixegotchi.gender === "male" ? "border-blue-500" : "border-pink-400"}`}>
                  {pixegotchi.gender === "male" ? (
                    <div className="flex gap-1 text-blue-400">
                      <Mars size={12} />
                      <span>Male</span>
                    </div>
                  ) : (
                    <div className="flex gap-1 text-pink-400">
                      <Venus size={12} />
                      <span>Female</span>
                    </div>
                  )}
                </span>
              </div>
            </div>

            {/* Compact Experience Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center font-pixel text-[9px] text-pixel-muted mb-1">
                <span className="">EXP</span>
                <span>
                  {pixegotchi.experience} / {experienceTarget}
                </span>
              </div>
              <div className="pixel-progress">
                <div
                  className="pixel-progress-fill transition-all duration-500"
                  style={{ width: `${experienceProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            <CompactStat
              icon={Heart}
              value={Number(pixegotchi.health)}
              bgColor="bg-red-500/20"
              strokeColor="text-red-500"
              rarity={pixegotchi.rarity}
            />
            <CompactStat
              icon={Apple}
              value={Number(pixegotchi.hunger)}
              bgColor="bg-orange-500/20"
              strokeColor="text-orange-500"
              rarity={pixegotchi.rarity}
            />
            <CompactStat
              icon={Zap}
              value={Number(pixegotchi.energy)}
              bgColor="bg-yellow-500/20"
              strokeColor="text-yellow-500"
              rarity={pixegotchi.rarity}
            />
            <CompactStat
              icon={Smile}
              value={Number(pixegotchi.happiness)}
              bgColor="bg-pink-500/20"
              strokeColor="text-pink-500"
              rarity={pixegotchi.rarity}
            />
            <CompactStat
              icon={Droplets}
              value={Number(pixegotchi.cleanliness)}
              bgColor="bg-blue-500/20"
              strokeColor="text-blue-500"
              rarity={pixegotchi.rarity}
            />
          </div>

          {/* Pixegotchi Visual */}
          <Visual pet={pixegotchi} status={null} />

          <div className="mt-2 grid grid-cols-3 gap-2">
            <div className="pixel-panel-soft p-2">
              <div className="font-pixel text-[8px] leading-3 text-pixel-muted">
                LVL
              </div>
              <div className="font-pixel text-sm leading-5 text-pixel-highlight">
                {pixegotchi.level}
              </div>
            </div>
            <div className="pixel-panel-soft col-span-2 p-2">
              <div className="flex items-center gap-1 font-pixel text-[8px] leading-3 text-pixel-muted">
                <Activity size={12} />
                <span>Status</span>
              </div>
              <div className="mt-1 font-pixel text-[10px] leading-4 capitalize text-pixel-ink">
                {statusLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <ActionButton
            icon={Apple}
            label="Feed"
            onClick={() => onNavigate("inventory", "food")}
            disabled={false}
            gradient="from-orange-500 to-red-500"
          />
          <ActionButton
            icon={Pill}
            label="Heal"
            onClick={() => onNavigate("inventory", "medicine")}
            disabled={false}
            gradient="from-green-500 to-emerald-500"
          />
          <ActionButton
            icon={Bubbles}
            label="Clean"
            onClick={() => onNavigate("inventory", "cleaning")}
            disabled={cooldowns.clean}
            gradient="from-cyan-500 to-blue-500"
          />
          <ActionButton
            icon={Gamepad2}
            label="Play"
            onClick={() => onNavigate("inventory", "toy")}
            disabled={false}
            gradient="from-purple-500 to-pink-500"
          />
          <ActionButton
            icon={Rocket}
            label="Boost"
            onClick={() => onNavigate("inventory", "boost")}
            gradient="from-yellow-500 to-orange-500"
          />
          <ActionButton
            icon={Moon}
            label="Sleep"
            onClick={() => handleAction("sleep")}
            disabled={true}
            gradient="from-blue-500 to-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="pixel-panel-soft flex items-center gap-2 p-2">
            <span className="pixel-icon-box h-8 w-8 text-pixel-highlight">
              <Gift size={16} />
            </span>
            <div className="min-w-0">
              <div className="font-pixel text-[9px] leading-3 text-pixel-ink">
                Daily
              </div>
              <div className="font-pixel text-[8px] leading-3 text-pixel-muted">
                Chest
              </div>
            </div>
          </div>
          <div className="pixel-panel-soft flex items-center gap-2 p-2">
            <span className="pixel-icon-box h-8 w-8 text-pixel-red">
              <Flame size={16} />
            </span>
            <div className="min-w-0">
              <div className="font-pixel text-[9px] leading-3 text-pixel-ink">
                Streak
              </div>
              <div className="font-pixel text-[8px] leading-3 text-pixel-muted">
                Day 1
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickInfo />
      </div>
  );
};
