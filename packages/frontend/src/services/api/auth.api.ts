import { apiClient } from "../client";

export interface AuthResponse {
  user: {
    id: number;
    telegramId: string;
    username?: string;
    pgsBalance: string;
  };
  token: string;
}

export const authApi = {
  telegram: async (initData: string): Promise<AuthResponse> => {
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
