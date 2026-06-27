import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useTelegramLogin } from "@/services/queries/auth.queries";
import { retrieveRawInitData } from "@tma.js/sdk";
import AuthorizationScreen from "@/components/Other/AuthorizationScreen";

export const AutoLoginProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isPending, mutate } = useTelegramLogin();
  const isAuthenticate = useAuthStore((s) => s.isAuthenticated);
  const initDataRaw = retrieveRawInitData();

  useEffect(() => {
    if (isAuthenticate || isPending) return;

    if (initDataRaw) {
      mutate(initDataRaw);
    }
  }, [isAuthenticate, initDataRaw, isPending, mutate]);

  if (!isAuthenticate) {
    return (
      <div className="splash">
        <AuthorizationScreen />
      </div>
    );
  }

  return <>{children}</>;
};
