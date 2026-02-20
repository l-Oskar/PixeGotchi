import { apiClient } from "./client";
import type { Pixegotchi } from "@shared";

export const pixegotchiApi = {
  getAll: async (): Promise<Pixegotchi[]> => {
    const { data } = await apiClient.get("/pixegotchi");
    return data;
  },

  getActive: async (): Promise<Pixegotchi | null> => {
    try {
      const { data } = await apiClient.get("/pixegotchi/active");
      return data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.get(`/pixegotchi/${id}`);
    return data;
  },

  feed: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(`/pixegotchi/${id}/feed`);
    return data;
  },

  play: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(`/pixegotchi/${id}/play`);
    return data;
  },

  sleep: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(`/pixegotchi/${id}/sleep`);
    return data;
  },

  clean: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(`/pixegotchi/${id}/clean`);
    return data;
  },

  heal: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(`/pixegotchi/${id}/heal`);
    return data;
  },

  hatch: async (name?: string): Promise<Pixegotchi> => {
    const { data } = await apiClient.post("/pixegotchi/hatch", { name });
    return data;
  },
};
