// app/GameBootstrap.tsx
import { useActivePixegotchi } from "../services/queries/pixegotchi.queries";
import { useAuthStore } from "../store/auth.store";
import SplashScreen from "../components/MainPage/SplashScreen";

export const GameBootstrap = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { isLoading } = useActivePixegotchi();

  if (!isAuthenticated || isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};
