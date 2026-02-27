// app/GameBootstrap.tsx
import { useEffect } from "react";
import { useActivePixegotchi } from "../services/queries/pixegotchi.queries";
import SplashScreen from "../components/MainPage/SplashScreen";
import {
  useGetAllEggs,
  useGetHatchingEgg,
} from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import { usePixegotchiStore } from "@/store/pixegotchi.store";

export const GameBootstrap = ({ children }: { children: React.ReactNode }) => {
  const { data: pixegotchi, isLoading: pixeLoading } = useActivePixegotchi();
  const { data: egg, isLoading: eggLoading } = useGetHatchingEgg();
  const { data: allEggs, isFetched } = useGetAllEggs();
  const setEgg = useEggStore((s) => s.setHatchingEgg);
  const setAlleggs = useEggStore((s) => s.setAllEggs);
  const setActive = usePixegotchiStore((s) => s.setActive);

  useEffect(() => {
    if (isFetched) {
      setAlleggs(allEggs!);
    }
    if (egg) {
      setEgg(egg);
    }
    if (pixegotchi) {
      setActive(pixegotchi);
    }
  }, [egg, pixegotchi, setEgg, setActive]);

  if (eggLoading || pixeLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};
