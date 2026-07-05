import React, { useEffect } from "react";
import { X } from "lucide-react";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";

export interface GameShellProps {
  title: string;
  score?: React.ReactNode;
  timer?: React.ReactNode;
  onExit: () => void;
  children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
  title,
  score,
  timer,
  onExit,
  children,
}) => {
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  const topInset = Math.max(
    0,
    (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0),
  );

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <section
      className="fixed inset-0 z-100 overflow-hidden bg-[linear-gradient(180deg,var(--color-pixel-bg)_0%,var(--color-pixel-bg-deep)_100%)] text-pixel-ink"
      style={{ paddingTop: `${topInset}px` }}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="pixel-panel mx-2 mt-2 grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-pixel-bg-deep/80 px-2 py-2">
          <button
            type="button"
            onClick={onExit}
            className="pixel-icon-button h-10 w-10 bg-pixel-surface-soft transition hover:border-pixel-highlight/70"
            aria-label="Exit game">
            <X size={20} />
          </button>

          <div className="min-w-0 text-center">
            <h1 className="truncate font-pixel text-[10px] leading-4 text-pixel-ink">
              {title}
            </h1>
            {score && (
              <div className="theme-readable-muted mt-0.5 truncate font-pixel text-[8px] leading-3">
                {score}
              </div>
            )}
          </div>

          <div className="min-w-10 text-right font-pixel text-[9px] leading-4 text-pixel-highlight">
            {timer}
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </section>
  );
};
