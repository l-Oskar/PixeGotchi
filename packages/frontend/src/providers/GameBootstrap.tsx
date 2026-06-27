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
import { useAllVault } from "@/services/queries/vault.queries";
import { useVaultStore } from "@/store/vault.store";

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
  const { data: vault } = useAllVault();
  const setVault = useVaultStore((s) => s.setAllVault);
  const setEgg = useEggStore((s) => s.setHatchingEgg);
  const clearEgg = useEggStore((s) => s.clearEgg);
  const setAlleggs = useEggStore((s) => s.setAllEggs);
  const setActive = usePixegotchiStore((s) => s.setActive);
  const clearActive = usePixegotchiStore((s) => s.setToVault);

  useEffect(() => {
    if (allEggs) {
      setAlleggs(allEggs);
    }
    if (vault) {
      setVault(vault);
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
    vault,
    egg,
    eggSuccess,
    pixegotchi,
    pixeSuccess,
    setAlleggs,
    setVault,
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
