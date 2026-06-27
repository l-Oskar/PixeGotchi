import { useQuery } from "@tanstack/react-query";
import { vaultApi } from "../api/vault.api";

export const VAULT_KEYS = {
  all: ["vault"] as const,
  stats: ["stats"] as const,
};

export const useAllVault = () => {
  return useQuery({
    queryKey: VAULT_KEYS.all,
    queryFn: vaultApi.getAllVault,
  });
};

export const useStatsVault = () => {
  return useQuery({
    queryKey: VAULT_KEYS.stats,
    queryFn: vaultApi.getStatsVault,
  });
};
