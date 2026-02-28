import { useQuery } from "@tanstack/react-query";
import { vaultApi } from "../api/vault.api";
import { useVaultStore } from "@/store/vault.store";

export const useAllVault = () => {
  const setAllVault = useVaultStore((s) => s.setAllVault);
  return useQuery({
    queryKey: ["vault"],
    queryFn: async () => {
      const data = await vaultApi.getAllVault();
      setAllVault(data);
    },
  });
};
