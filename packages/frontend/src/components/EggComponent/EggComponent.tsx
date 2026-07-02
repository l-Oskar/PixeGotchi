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

export interface EggPageProps {
  onNavigate?: (page: PageType) => void;
}

const TAP_INTERVAL = 2000; // 2 секунди

const EggComponent: React.FC<EggPageProps> = ({
  onNavigate,
}) => {
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
      <div className="p-3 space-y-3">
        <div className="pixel-panel p-4">
          <div className="pixel-panel-soft grid min-h-48 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 p-4 text-center">
            <div>
              <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-sm border border-pixel-border/70 bg-pixel-surface/40">
                <EggIcon className="text-pixel-muted" size={38} />
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
      <div className="p-3">
        <div className="pixel-panel p-4">
          <div className="pixel-panel-soft flex min-h-48 items-center justify-center border-pixel-red/60 bg-pixel-bg-deep/40 p-4 text-center">
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
    <div className="p-3 space-y-3">
      <div className="pixel-panel p-3">
        <div className="pixel-panel-soft mb-3 overflow-hidden border-pixel-highlight/60 bg-linear-to-br from-pixel-highlight/20 via-pixel-surface-soft to-pixel-bg-deep p-4">
          <div className="grid grid-cols-[1fr_auto] items-center gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex items-center gap-2">
                <EggIcon className="text-pixel-highlight" size={16} />
                <h2 className="truncate font-pixel text-sm leading-5 text-pixel-ink">
                  {`Egg-#${egg.id}`}
                </h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span
                  className={`rounded-sm border px-2 py-1 font-pixel text-[8px] leading-3 ${
                    isReady
                      ? "border-green-400/50 bg-green-500/20 text-green-200"
                      : "border-orange-400/50 bg-orange-500/20 text-orange-200"
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

            <div className="pixel-panel-soft grid h-20 w-20 place-items-center border-pixel-highlight/50 bg-pixel-bg-deep/40 shadow-pixel-inset">
              <EggIcon className="text-pixel-highlight" size={40} />
            </div>
          </div>

          {!isReady && (
            <div className="pixel-progress mt-3 w-full">
              <div
                className="pixel-progress-fill transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Visual компонент - передаємо egg та статус */}
        <Visual pet={egg} status={eggStatus ?? null} />

        <div className="mt-3 grid grid-cols-3 gap-2">
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
          <div className="mt-3 text-center font-pixel text-[8px] leading-4 text-pixel-muted">
            Tap to interact with the egg and speed up hatching!
          </div>
        )}
      </div>
      <QuickInfo />
    </div>
  );
};

export default EggComponent;
