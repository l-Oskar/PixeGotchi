import React, { useMemo } from "react";
import { Link } from "@/components/Link/Link.tsx";
import { PageType } from "@shared";
import { Gamepad2, Moon, Egg as EggIcon, Menu } from "lucide-react";
import {
  useGetHatchingStatus,
  useHatchEgg,
} from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import ActionButton from "@/components/MainPage/ActionButton";
import { Visual } from "../MainPage/Visual";

export interface EggPageProps {
  onNavigate?: (page: PageType) => void;
}

const EggComponent: React.FC<EggPageProps> = ({ onNavigate }) => {
  const egg = useEggStore((s) => s.hatchingEgg);
  const hatchEgg = useHatchEgg();

  // Використовуємо умовний запит - тільки якщо є egg
  const status = useGetHatchingStatus(egg?.id!);

  // Ранній вихід якщо немає яйця
  if (!egg) {
    return (
      <div className="mt-5 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex justify-center items-center h-56">
          <div className="text-white/60">No egg is hatching</div>
        </div>
      </div>
    );
  }

  // Статус завантаження
  if (status.isLoading) {
    return (
      <div className="mt-5 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex justify-center items-center h-56">
          <div className="text-white/60">Loading egg status...</div>
        </div>
      </div>
    );
  }

  // Обробка помилки
  if (status.isError) {
    return (
      <div className="mt-5 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex justify-center items-center h-56">
          <div className="text-red-400">Failed to load egg status</div>
        </div>
      </div>
    );
  }

  const eggStatus = status.data;
  const progress = eggStatus ? Math.floor(eggStatus.progress * 10) / 10 : 0;
  const isReady = eggStatus?.canHatchNow;

  const handleHatch = async () => {
    if (isReady) {
      try {
        hatchEgg.mutate(egg.id);
        console.log("Hatching egg...");
        onNavigate?.("home");
      } catch (error) {
        console.error("Failed to hatch egg:", error);
      }
    }
  };

  const handleTap = async () => {
    try {
      // Логіка для tap (прискорення висиджування)
      console.log("Tapping egg...");
      // Можна викликати мутацію для tap
    } catch (error) {
      console.error("Failed to tap egg:", error);
    }
  };

  return (
    <>
      <div className="mt-5 bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {`Egg-#${egg.id}`}
            </h2>
            <Link to="/index">
              <button className="text-white/60 hover:text-white">
                <Menu size={20} />
              </button>
            </Link>
          </div>

          <div className="flex gap-2 mt-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                  isReady
                    ? "bg-green-500/30 border-green-400/50"
                    : "bg-orange-500/30 border-orange-400/50"
                }`}>
                {isReady ? "Ready to hatch!" : "Hatching"}
              </span>

              {!isReady && (
                <span className="text-xs px-2 py-0.5 bg-purple-500/30 rounded-full border border-purple-400/50">
                  Progress: {progress}%
                </span>
              )}
            </div>
          </div>

          {/* Прогрес бар для візуалізації */}
          {!isReady && (
            <div className="mt-3 w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Visual компонент - передаємо egg та статус */}
        <Visual pet={egg} status={eggStatus!} />

        <div className="mt-5 grid grid-cols-3 gap-3">
          <ActionButton
            icon={EggIcon}
            label={isReady ? "Hatch Now!" : "Hatch"}
            onClick={handleHatch}
            disabled={!isReady}
            gradient="from-orange-500 to-red-500"
          />
          <ActionButton
            icon={Gamepad2}
            label="Play"
            onClick={handleTap}
            disabled={false}
            gradient="from-purple-500 to-pink-500"
          />
          <ActionButton
            icon={Moon}
            label="Sleep"
            onClick={() => {}}
            disabled={true}
            gradient="from-blue-500 to-indigo-500"
          />
        </div>

        {/* Підказка для користувача */}
        {!isReady && (
          <div className="mt-4 text-xs text-white/40 text-center">
            Tap "Play" to interact with the egg and speed up hatching!
          </div>
        )}
      </div>
    </>
  );
};

export default EggComponent;
