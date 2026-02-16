import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useTelegramLogin } from "@/services/queries/auth.queries";
import { initData, useSignal } from "@tma.js/sdk-react";

export const AutoLiginProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loginMutation = useTelegramLogin();
  const isAuthenticate = useAuthStore((s) => s.isAuthenticated);
  const initDataRaw = useSignal(initData.raw);

  useEffect(() => {
    if (isAuthenticate) return;

    const initData = import.meta.env.VITE_DEV_INIT_DATA || initDataRaw;

    if (initData) {
      loginMutation.mutate(initData);
    }
  }, [isAuthenticate]);

  if (!isAuthenticate) {
    return <div>Authorization...</div>;
  }

  return <>{children}</>;
};
