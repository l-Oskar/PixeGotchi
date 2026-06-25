import React, { useRef, useEffect } from "react";
import { PageType, Pixegotchi } from "@pixegotchi/shared";
import { Hourglass, CircleX, Egg as EggIcon } from "lucide-react";
import {
  useGetHatchingStatus,
  useHatchEgg,
  useBatchTap,
  useCancelHatchingEgg,
} from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import ActionButton from "@/components/MainPage/ActionButton";
import { Visual } from "../MainPage/Visual";
import Loader from "../Other/Loader";
import QuickInfo from "../Other/QuickInfo";

export interface EggPageProps {
  onNavigate?: (page: PageType) => void;
  setActivePixegotchi: (pixegitchi: Pixegotchi) => void;
}

const TAP_INTERVAL = 2000; // 2 секунди

const EggComponent: React.FC<EggPageProps> = ({
  onNavigate,
  setActivePixegotchi,
}) => {
  const egg = useEggStore((s) => s.hatchingEgg);
  const hatchEgg = useHatchEgg();
  const cancelHatching = useCancelHatchingEgg();
  const batchTapMutation = useBatchTap();

  // Реф для доступу до мутації без перевизначення інтервалу
  const batchTapRef = useRef(batchTapMutation.mutate);
  batchTapRef.current = batchTapMutation.mutate;

  // Використовуємо умовний запит - тільки якщо є egg
  const status = useGetHatchingStatus(egg?.id!);

  // Реф для зберігання кількості тапів
  const tapCountRef = useRef<number>(0);
  // Реф для зберігання ID інтервалу
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ранній вихід якщо немає яйця
  if (!egg) {
    return (
      <div className="p-4 space-y-4">
        <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
          <div className="flex justify-center items-center h-56">
            <div className="text-white/60">No egg is hatching</div>
          </div>
        </div>
      </div>
    );
  }

  // Статус завантаження
  if (status.isLoading) {
    <Loader title={"Loading egg status..."} />;
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
        const newPixe = await hatchEgg.mutateAsync(egg.id);
        setActivePixegotchi(newPixe);
        onNavigate?.("home");
      } catch (error) {
        console.error("Failed to hatch egg:", error);
      }
    }
  };

  const handleCancelHatching = async () => {
    if (eggStatus?.isHatching) {
      try {
        await cancelHatching.mutateAsync(egg.id);
        onNavigate?.("start");
      } catch (error) {
        console.error("Fail to cancel", error);
      }
    }
  };

  const handleTap = () => {
    // Збільшуємо лічильник тапів
    tapCountRef.current += 1;
    console.log(`Tap! Total taps: ${tapCountRef.current}`);
  };

  // Ефект для відправки batch tap запиту кожні 2 секунди
  useEffect(() => {
    if (!egg?.id || isReady) return;

    // Очищаємо попередній інтервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const tapCount = tapCountRef.current;

      if (tapCount > 0) {
        console.log(`Sending batch tap: ${tapCount} taps`);
        batchTapRef.current({ eggId: egg.id, tapCount });
        tapCountRef.current = 0; // Скидаємо лічильник після відправки
      }
    }, TAP_INTERVAL);

    // Очищення при розмонтуванні або зміні залежностей
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [egg?.id, isReady]);

  return (
    <div className="p-4 space-y-4">
      <div className="bg-linear-to-br from-pink-500/20 to-purple-600/20 rounded-3xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {`Egg-#${egg.id}`}
            </h2>
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
            icon={Hourglass}
            label="Tap"
            onClick={handleTap}
            disabled={false}
            gradient="from-purple-500 to-pink-500"
          />
          <ActionButton
            icon={CircleX}
            label="Cancel"
            onClick={handleCancelHatching}
            disabled={false}
            gradient="from-blue-500 to-indigo-500"
          />
        </div>

        {/* Підказка для користувача */}
        {!isReady && (
          <div className="mt-4 text-xs text-white/40 text-center">
            Tap to interact with the egg and speed up hatching!
          </div>
        )}
      </div>
      <QuickInfo />
    </div>
  );
};

export default EggComponent;
