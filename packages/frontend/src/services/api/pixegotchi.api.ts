import { apiClient } from "../client";

export interface Pixegotchi {
  id: number;
  name: string;
  level: number;
  element: string;
  rarity: string;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  experience: number;
  status: string;
  genomeHash: string;
  lastUpdateAt: string;
}

export const pixegotchiApi = {
  getAll: async (): Promise<Pixegotchi[]> => {
    const { data } = await apiClient.get("/pixegotchi");
    return data;
  },

  getActive: async (): Promise<Pixegotchi> => {
    const { data } = await apiClient.get("/pixegotchi/active");
    return data;
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
