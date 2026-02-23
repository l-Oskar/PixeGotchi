import { apiClient } from "./client";
import { UserProfile } from "@shared";

export const USER_URL = "/users";
export const USER_URL_KEYS = {
  profile: `${USER_URL}/me` as const,
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
};
