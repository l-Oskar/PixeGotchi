import { apiClient } from "./client";

export interface UserProfile {
  id: number;
  telegramId: string;
  walletAddress: string | null;
  username: string;
  pgcBalance: string;
  lastActiveAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  pixegotchis: [];
  inventory: [];
  vault: [];
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
