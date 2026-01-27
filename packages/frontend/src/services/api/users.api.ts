import { apiClient } from "../client";

export interface UserProfile {
  id: number;
  telegramId: string;
  username?: string;
  walletAddress?: string;
  tmcBalance: string;
  tamagotchis: any[];
  inventory: any[];
  vault: any[];
}

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get("/users/me");
    return data;
  },

  updateProfile: async (
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const { data } = await apiClient.patch("/users/me", updates);
    return data;
  },
};
