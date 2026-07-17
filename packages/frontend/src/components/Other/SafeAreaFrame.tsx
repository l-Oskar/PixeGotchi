import type { CSSProperties, ReactNode } from "react";

interface SafeAreaFrameProps {
  children: ReactNode;
  className?: string;
  gap?: string;
}

type SafeAreaFrameStyle = CSSProperties & {
  "--safe-area-frame-gap": string;
};

const telegramInset = (side: "top" | "right" | "bottom" | "left") =>
  `calc(var(--tg-viewport-safe-area-inset-${side}, 0px) + var(--tg-viewport-content-safe-area-inset-${side}, 0px))`;

const browserInset = (side: "top" | "right" | "bottom" | "left") =>
  `env(safe-area-inset-${side}, 0px)`;

const SafeAreaFrame = ({
  children,
  className = "",
  gap = "1rem",
}: SafeAreaFrameProps) => {
  const style: SafeAreaFrameStyle = {
    "--safe-area-frame-gap": gap,
    paddingTop:
      `calc(var(--safe-area-frame-gap) + max(${telegramInset("top")}, ${browserInset("top")}))`,
    paddingRight:
      `calc(var(--safe-area-frame-gap) + max(${telegramInset("right")}, ${browserInset("right")}))`,
    paddingBottom:
      `calc(var(--safe-area-frame-gap) + max(${telegramInset("bottom")}, ${browserInset("bottom")}))`,
    paddingLeft:
      `calc(var(--safe-area-frame-gap) + max(${telegramInset("left")}, ${browserInset("left")}))`,
  };

  return (
    <div className={`box-border ${className}`} style={style}>
      {children}
    </div>
  );
};

export default SafeAreaFrame;
