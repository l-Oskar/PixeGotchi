import { User } from "@shared";
import { apiClient } from "./client";

export interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  telegramLogin: async (initData: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/telegram", {
      initData,
    });
    return data;
  },
  refreshToken: async (): Promise<{ token: string }> => {
    const { data } = await apiClient.post("/auth/refresh");
    return data;
  },
};
