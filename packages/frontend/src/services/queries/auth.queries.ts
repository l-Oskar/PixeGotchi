import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/store/auth.store";

export const useTelegramLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (initData: string) => authApi.telegramLogin(initData),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};
