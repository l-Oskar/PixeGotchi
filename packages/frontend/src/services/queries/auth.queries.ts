import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { useUserStore } from "@/store/user.store";
import { USER_KEYS } from "./users.queries";

export const useTelegramLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useUserStore((s) => s.setUser);

  return useMutation({
    mutationFn: (initData: string) => authApi.telegramLogin(initData),
    onSuccess: (data) => {
      setAuth(data.token);
      queryClient.setQueryData(USER_KEYS.profile, data.user);
      setUser(data.user);
    },
  });
};
