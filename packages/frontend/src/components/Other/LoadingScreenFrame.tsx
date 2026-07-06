import React, { type CSSProperties } from "react";
import { viewport } from "@tma.js/sdk";
import { useSignal } from "@tma.js/sdk-react";

interface LoadingScreenFrameProps {
  children: React.ReactNode;
  withBackground?: boolean;
}

const LoadingScreenFrame: React.FC<LoadingScreenFrameProps> = ({
  children,
  withBackground = false,
}) => {
  const safeAreaInsetTop = useSignal(viewport.safeAreaInsetTop);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  const topInset = Math.max(
    0,
    (safeAreaInsetTop ?? 0) + (contentSafeAreaInsetTop ?? 0),
  );

  return (
    <div
      className={`box-border min-h-[100dvh] w-full p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pl-[calc(0.75rem+env(safe-area-inset-left))] pr-[calc(0.75rem+env(safe-area-inset-right))] text-pixel-ink ${
        withBackground ? "bg-pixel-bg" : "bg-pixel-bg/95"
      }`}
      style={
        {
          "--loading-safe-top": `${topInset}px`,
          paddingTop: `calc(0.75rem + ${topInset}px)`,
        } as CSSProperties
      }>
      <div className="pixel-panel min-h-[calc(100dvh-var(--loading-safe-top)-env(safe-area-inset-bottom)-1.5rem)] w-full p-4">
        <div className="flex min-h-[calc(100dvh-var(--loading-safe-top)-env(safe-area-inset-bottom)-3.5rem)] flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreenFrame;
