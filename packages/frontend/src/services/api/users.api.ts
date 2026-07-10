import { apiClient } from "./client";
import { UserProfile } from "@pixegotchi/shared";

export const USER_URL = "/users";
export const USER_URL_KEYS = {
  profile: `${USER_URL}/me` as const,
  balance: `${USER_URL}/add_balance` as const,
};

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await apiClient.get(USER_URL_KEYS.profile);
    return data;
  },

  updateProfile: async (
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> => {
    const { data } = await apiClient.patch(USER_URL_KEYS.profile, updates);
    return data;
  },

  updateUserPgc: async (amount: number): Promise<UserProfile> => {
    const { data } = await apiClient.post(USER_URL_KEYS.balance, { amount });
    return data;
  },
};
