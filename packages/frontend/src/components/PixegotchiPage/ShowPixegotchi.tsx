import { useState } from "react";
import { Link } from "@/components/Link/Link.tsx";
import { Cooldowns, HomePageProps, PageType } from "@shared";
import {
  Heart,
  ShoppingBag,
  Gamepad2,
  Moon,
  Apple,
  Pill,
  Trash2,
  Zap,
  Smile,
  Droplets,
  Menu,
} from "lucide-react";
import CompactStat from "@/components/MainPage/CompactStat";
import ActionButton from "@/components/MainPage/ActionButton";
import { Visual } from "../MainPage/Visual";
import { eggApi } from "@/services/api/egg.api";
import { pixegotchiApi } from "@/services/api/pixegotchi.api";

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

  if (!pixegotchi) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* Pixegotchi Card */}
      <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {pixegotchi.name ?? "Unknown"}
              <span className="text-lg">🌈</span>
            </h2>
            <Link to="/index">
              <button className="text-white/60 hover:text-white">
                <Menu size={20} />
              </button>
            </Link>
          </div>
          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-orange-500/30 rounded-full border border-orange-400/50 capitalize">
                {pixegotchi.rarity}
              </span>
              <span className="text-xs px-2 py-0.5 bg-blue-500/30 rounded-full border border-blue-400/50 capitalize">
                {pixegotchi.element}
              </span>
              <span className="text-xs px-2 py-0.5 bg-purple-500/30 rounded-full border border-purple-400/50">
                Lvl {pixegotchi.level}
              </span>
            </div>

            {/* Compact Experience Bar */}
            <div className="mb-1 flex-1 min-w-0">
              <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                <span>EXP</span>
                <span>
                  {pixegotchi.experience} / {1000}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(pixegotchi.experience / (1000 - pixegotchi.experience)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          <CompactStat
            icon={Heart}
            value={pixegotchi!.health}
            bgColor="bg-red-500/20"
            strokeColor="text-red-500"
          />
          <CompactStat
            icon={Apple}
            value={100 - pixegotchi!.hunger}
            bgColor="bg-orange-500/20"
            strokeColor="text-orange-500"
          />
          <CompactStat
            icon={Zap}
            value={pixegotchi!.energy}
            bgColor="bg-yellow-500/20"
            strokeColor="text-yellow-500"
          />
          <CompactStat
            icon={Smile}
            value={pixegotchi!.happiness}
            bgColor="bg-pink-500/20"
            strokeColor="text-pink-500"
          />
          <CompactStat
            icon={Droplets}
            value={pixegotchi!.cleanliness}
            bgColor="bg-blue-500/20"
            strokeColor="text-blue-500"
          />
        </div>

        {/* Pixegotchi Visual */}
        <Visual pet={pixegotchi} status={null} />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <ActionButton
          icon={Apple}
          label="Feed"
          onClick={() => handleAction("feed")}
          disabled={cooldowns.feed}
          gradient="from-orange-500 to-red-500"
        />
        <ActionButton
          icon={Gamepad2}
          label="Play"
          onClick={() => handleAction("play")}
          disabled={cooldowns.play}
          gradient="from-purple-500 to-pink-500"
        />
        <ActionButton
          icon={Moon}
          label="Sleep"
          onClick={() => handleAction("sleep")}
          disabled={cooldowns.sleep}
          gradient="from-blue-500 to-indigo-500"
        />
        <ActionButton
          icon={Pill}
          label="Heal"
          onClick={() => handleAction("heal")}
          disabled={cooldowns.heal}
          gradient="from-green-500 to-emerald-500"
        />
        <ActionButton
          icon={Trash2}
          label="Clean"
          onClick={() => pixegotchiApi.setInActive()}
          disabled={cooldowns.clean}
          gradient="from-cyan-500 to-blue-500"
        />
        <ActionButton
          icon={ShoppingBag}
          label="Items"
          onClick={() => onNavigate("inventory" as PageType)}
          gradient="from-yellow-500 to-orange-500"
        />
      </div>

      {/* Quick Stats */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
        <h3 className="text-sm font-semibold mb-3 text-white/80">Quick Info</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              🎮
            </div>
            <div>
              <div className="text-white/60 text-xs">Games Played</div>
              <div className="font-semibold">47</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              ⏱️
            </div>
            <div>
              <div className="text-white/60 text-xs">Age</div>
              <div className="font-semibold">12 days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
