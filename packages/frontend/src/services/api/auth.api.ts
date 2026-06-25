import { User } from "@pixegotchi/shared";
import { apiClient } from "./client";

export const AUTH_URL = "/auth";
export const AUTH_URL_KEYS = {
  login: `${AUTH_URL}/telegram` as const,
  refresh: `${AUTH_URL}/refresh` as const,
};

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  telegramLogin: async (initData: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(AUTH_URL_KEYS.login, {
      initData,
    });
    return data;
  },
  refreshToken: async (): Promise<{ token: string }> => {
    const { data } = await apiClient.post(AUTH_URL_KEYS.refresh);
    return data;
  },
};
