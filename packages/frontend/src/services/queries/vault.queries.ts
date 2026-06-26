import { useQuery } from "@tanstack/react-query";
import { vaultApi } from "../api/vault.api";

export const useAllVault = () => {
  return useQuery({
    queryKey: ["vault"],
    queryFn: vaultApi.getAllVault,
  });
};

export const useStatsVault = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: vaultApi.getStatsVault,
  });
};
