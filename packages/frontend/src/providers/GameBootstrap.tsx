// app/GameBootstrap.tsx
import { useEffect } from "react";
import { useActivePixegotchi } from "../services/queries/pixegotchi.queries";
import SplashScreen from "../components/Other/SplashScreen";
import {
  useGetAllEggs,
  useGetHatchingEgg,
} from "@/services/queries/egg.queries";
import { useEggStore } from "@/store/egg.store";
import { usePixegotchiStore } from "@/store/pixegotchi.store";
import { useStatsVault } from "@/services/queries/vault.queries";
import { useDetailedInventory } from "@/services/queries/inventory.queries";
import { useGetSortedChests } from "@/services/queries/chest.queries";

export const GameBootstrap = ({ children }: { children: React.ReactNode }) => {
  const {
    data: pixegotchi,
    isLoading: pixeLoading,
    isSuccess: pixeSuccess,
  } = useActivePixegotchi();
  const {
    data: egg,
    isLoading: eggLoading,
    isSuccess: eggSuccess,
  } = useGetHatchingEgg();
  const { data: allEggs } = useGetAllEggs();
  useDetailedInventory();
  useGetSortedChests();
  useStatsVault();
  const setEgg = useEggStore((s) => s.setHatchingEgg);
  const clearEgg = useEggStore((s) => s.clearEgg);
  const setAlleggs = useEggStore((s) => s.setAllEggs);
  const setActive = usePixegotchiStore((s) => s.setActive);
  const clearActive = usePixegotchiStore((s) => s.setToVault);

  useEffect(() => {
    if (allEggs) {
      setAlleggs(allEggs);
    }
    if (eggSuccess) {
      if (egg) {
        setEgg(egg);
      } else {
        clearEgg();
      }
    }
    if (pixeSuccess) {
      if (pixegotchi) {
        setActive(pixegotchi);
      } else {
        clearActive();
      }
    }
  }, [
    allEggs,
    egg,
    eggSuccess,
    pixegotchi,
    pixeSuccess,
    setAlleggs,
    setEgg,
    clearEgg,
    setActive,
    clearActive,
  ]);

  if (eggLoading || pixeLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};
