import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useTelegramLogin } from "@/services/queries/auth.queries";
import { retrieveRawInitData } from "@tma.js/sdk";

export const AutoLiginProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loginMutation = useTelegramLogin();
  const isAuthenticate = useAuthStore((s) => s.isAuthenticated);
  const initDataRaw = retrieveRawInitData();

  useEffect(() => {
    if (isAuthenticate) return;

    if (initDataRaw) {
      //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      loginMutation.mutate(initDataRaw);
      //loginMutation.mutate(import.meta.env.VITE_DEV_INIT_DATA);
    }
  }, [isAuthenticate, initDataRaw]);

  if (!isAuthenticate) {
    return <div className="splash animation-bounce">{`Authorization...`}</div>;
  }

  return <>{children}</>;
};
