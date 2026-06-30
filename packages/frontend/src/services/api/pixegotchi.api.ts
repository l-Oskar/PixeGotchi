import { apiClient } from "./client";
import type { Pixegotchi } from "@pixegotchi/shared";

export const PIXEGOTCHI_URL = "/pixegotchi";
export const PIXEGOTCHI_URL_KEYS = {
  all: `${PIXEGOTCHI_URL}` as const,
  current: `${PIXEGOTCHI_URL}/current` as const,
  inActive: `${PIXEGOTCHI_URL}/inactive` as const,
  id: (id: number | null) => `${PIXEGOTCHI_URL}/${id}` as const,
};

export const pixegotchiApi = {
  getAll: async (): Promise<Pixegotchi[]> => {
    const { data } = await apiClient.get(PIXEGOTCHI_URL_KEYS.all);
    return data;
  },

  getCurrent: async (): Promise<Pixegotchi | null> => {
    const { data } = await apiClient.get(PIXEGOTCHI_URL_KEYS.current);
    return data;
  },

  setInActive: async (): Promise<Pixegotchi | null> => {
    const { data } = await apiClient.post(PIXEGOTCHI_URL_KEYS.inActive);
    return data;
  },

  getById: async (id: number): Promise<Pixegotchi | null> => {
    const { data } = await apiClient.get(PIXEGOTCHI_URL_KEYS.id(id));
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
};
