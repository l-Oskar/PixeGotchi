import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";

export const useTelegramLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (initData: string) => authApi.telegramLogin(initData),
    onSuccess: (data) => {
      setAuth(data.token);
      setUser(data.user);
    },
  });
};
