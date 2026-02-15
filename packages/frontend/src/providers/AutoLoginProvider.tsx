import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useTelegramLogin } from "@/services/queries/auth.queries";

export const AutoLiginProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const loginMutation = useTelegramLogin();
  const isAuthenticate = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticate) return;

    const initData = import.meta.env.VITE_DEV_INIT_DATA;

    if (initData) {
      loginMutation.mutate(initData);
    }
  }, [isAuthenticate]);

  if (!isAuthenticate) {
    return <div>Authorization...</div>;
  }

  return <>{children}</>;
};
