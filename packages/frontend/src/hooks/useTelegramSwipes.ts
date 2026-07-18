import { useEffect, useState } from "react";

export const useTelegramSwipes = (disabled: boolean) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;

    if (tg && !tg.isReady) {
      tg.ready();
      setIsReady(true);
    } else if (tg) {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const tg = (window as any)?.Telegram?.WebApp;

    const hasControl =
      tg &&
      typeof tg.disableVerticalSwipes === "function" &&
      typeof tg.enableVerticalSwipes === "function";

    if (!hasControl) return;

    if (disabled) {
      tg.disableVerticalSwipes();
    } else {
      tg.enableVerticalSwipes();
    }

    return () => {
      if (tg && disabled && typeof tg.enableVerticalSwipes === "function") {
        tg.enableVerticalSwipes();
      }
    };
  }, [disabled, isReady]);
};
