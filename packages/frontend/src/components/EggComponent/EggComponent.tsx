import React, { useRef, useEffect } from "react";
import { PageType } from "@pixegotchi/shared";
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
import { getEggImg } from "@/utils/getImage";

export interface EggPageProps {
  onNavigate?: (page: PageType) => void;
}

const TAP_INTERVAL = 2000; // 2 секунди

const EggComponent: React.FC<EggPageProps> = ({ onNavigate }) => {
  const egg = useEggStore((s) => s.hatchingEgg);
  const hatchEgg = useHatchEgg();
  const cancelHatching = useCancelHatchingEgg();
  const batchTapMutation = useBatchTap();

  // Реф для доступу до мутації без перевизначення інтервалу
  const batchTapRef = useRef(batchTapMutation.mutate);
  batchTapRef.current = batchTapMutation.mutate;

  // Використовуємо умовний запит - тільки якщо є egg
  const status = useGetHatchingStatus(egg?.id ?? null);

  // Реф для зберігання кількості тапів
  const tapCountRef = useRef<number>(0);
  // Реф для зберігання ID інтервалу
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const eggStatus = status.data;
  const progress = eggStatus ? Math.floor(eggStatus.progress * 10) / 10 : 0;
  const isReady = eggStatus?.canHatchNow;

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

  // Ранній вихід якщо немає яйця
  if (!egg) {
    return (
      <div className="space-y-2.5 p-2.5">
        <div className="pixel-panel p-3">
          <div className="pixel-panel-soft grid min-h-40 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 p-3 text-center">
            <div>
              <div className="mx-auto mb-2.5 grid h-16 w-16 place-items-center rounded-sm border border-pixel-border/70 bg-pixel-surface/40">
                <img src={getEggImg()} className="w-10 h-13" alt="Egg" />
              </div>
              <div className="font-pixel text-[10px] leading-4 text-pixel-muted">
                No egg is hatching
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Статус завантаження
  if (status.isLoading) {
    return <Loader title={"Loading egg status..."} />;
  }

  // Обробка помилки
  if (status.isError) {
    return (
      <div className="p-2.5">
        <div className="pixel-panel p-3">
          <div className="pixel-panel-soft flex min-h-40 items-center justify-center border-pixel-red/60 bg-pixel-bg-deep/40 p-3 text-center">
            <div className="font-pixel text-[10px] leading-4 text-pixel-red">
              Failed to load egg status
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleHatch = async () => {
    if (isReady) {
      try {
        await hatchEgg.mutateAsync(egg.id);
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
  };

  return (
    <div className="space-y-2.5 p-2.5">
      <div className="pixel-panel p-2.5">
        <div className="pixel-panel-soft mb-2.5 overflow-hidden border-pixel-highlight/60 bg-linear-to-br from-pixel-highlight/20 via-pixel-surface-soft to-pixel-bg-deep p-3">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2.5">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2">
                <img src={getEggImg()} className="w-10 h-13" alt="Egg" />
                <h2 className="truncate font-pixel text-xs leading-5 text-pixel-ink">
                  {`Egg-#${egg.id}`}
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`rounded-sm border px-2 py-1 font-pixel text-[8px] leading-3 ${
                    isReady
                      ? "border-pixel-green/50 bg-pixel-green/15 text-pixel-green"
                      : "border-pixel-orange/50 bg-pixel-orange/15 text-pixel-orange"
                  }`}>
                  {isReady ? "Ready to hatch!" : "Hatching"}
                </span>

                {!isReady && (
                  <span className="rounded-sm border border-pixel-highlight/35 bg-pixel-bg-deep/60 px-2 py-1 font-pixel text-[8px] leading-3 text-pixel-highlight">
                    {progress}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isReady && (
            <div className="pixel-progress mt-2.5 h-2.5 w-full">
              <div
                className="pixel-progress-fill transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Visual компонент - передаємо egg та статус */}
        <Visual pet={egg} status={eggStatus ?? null} />

        <div className="mt-2.5 grid grid-cols-3 gap-2">
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
          <div className="mt-2.5 text-center font-pixel text-[8px] leading-4 text-pixel-muted">
            Tap to interact with the egg and speed up hatching!
          </div>
        )}
      </div>
      <QuickInfo />
    </div>
  );
};

export default EggComponent;
