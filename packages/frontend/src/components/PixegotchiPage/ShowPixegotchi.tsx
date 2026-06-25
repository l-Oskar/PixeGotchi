import { useEffect, useState } from "react";
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
} from "lucide-react";
import CompactStat from "@/components/MainPage/CompactStat";
import ActionButton from "@/components/MainPage/ActionButton";
import { Visual } from "../MainPage/Visual";
import { useActivePixegotchi } from "@/services/queries/pixegotchi.queries";
import QuickInfo from "../Other/QuickInfo";
import Loader from "../Other/Loader";

export const ShowPixeGotchi: React.FC<HomePageProps> = ({
  pixegotchi,
  onNavigate,
}) => {
  const getActive = useActivePixegotchi();

  useEffect(() => {}, [getActive.data]);

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

  if (getActive.isLoading) return <Loader title={"Pixegotchi is loading..."} />;

  if (pixegotchi)
    return (
      <div className="p-4 space-y-4">
        {/* Pixegotchi Card */}
        <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-5 border border-white/10 backdrop-blur-sm">
          <div className="flex flex-col gap-1 mb-3">
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {pixegotchi.name ?? "Unknown"}
              </h2>
              <button
                onClick={() => onNavigate("data")}
                className="text-white/60 hover:text-white">
                <Menu size={20} />
              </button>
            </div>
            <div className="flex gap-2 py-1">
              <div className="flex justify-between flex-1">
                <span
                  className={`text-xs px-2 py-0.5 ${RARITY_COLORS[pixegotchi.rarity]} rounded-full border capitalize`}>
                  {pixegotchi.rarity}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 ${ELEMENT_COLORS[pixegotchi.element]} rounded-full border capitalize`}>
                  {pixegotchi.element}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 bg-amber-200/20 rounded-full border ${pixegotchi.gender === "male" ? "border-blue-500" : "border-pink-400"}`}>
                  {pixegotchi.gender === "male" ? (
                    <div className="flex gap-1 text-blue-400 ">
                      <Mars size={16} />
                      <span>Male</span>
                    </div>
                  ) : (
                    <div className="flex gap-1 text-pink-400">
                      <Venus size={16} />
                      <span>Female</span>
                    </div>
                  )}
                </span>
                <span className="text-xs px-2 py-0.5 bg-blue-400/30 rounded-full border border-blue-400/50 text-blue-400">
                  Level {pixegotchi.level}
                </span>
              </div>
            </div>

            {/* Compact Experience Bar */}
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center text-[10px] text-white/60 mb-1">
                <span className="">EXP</span>
                <span>
                  {pixegotchi.experience} / {1000}
                </span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${(pixegotchi.experience * 100) / 1000}%`,
                  }}
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
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
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
          {/* <ActionButton
            icon={Vault}
            label="Vault"
            onClick={() => handleSetToVault()}
            disabled={cooldowns.clean}
            gradient="from-violer-500 to-purple-500"
          /> */}
        </div>

        {/* Quick Stats */}
        <QuickInfo />
      </div>
    );
};
