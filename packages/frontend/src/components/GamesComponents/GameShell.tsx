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
      className="fixed inset-0 z-100 bg-[#121528] text-white overflow-hidden"
      style={{ paddingTop: `${topInset}px` }}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 bg-black/55 backdrop-blur-md border-b border-white/10">
          <button
            type="button"
            onClick={onExit}
            className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition flex items-center justify-center"
            aria-label="Exit game">
            <X size={20} />
          </button>

          <div className="min-w-0 text-center">
            <h1 className="text-sm font-semibold truncate">{title}</h1>
            {score && (
              <div className="mt-0.5 text-xs text-white/75 truncate">
                {score}
              </div>
            )}
          </div>

          <div className="min-w-10 text-right text-sm font-mono text-white/90">
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
