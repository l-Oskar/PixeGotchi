import { apiClient } from "./client";
import { Egg, Pixegotchi, UpdatedEgg } from "@shared";

const egg_url = "/eggs";

export const eggApi = {
  getAllEggs: async (): Promise<Egg[]> => {
    const { data } = await apiClient.get(egg_url);
    return data;
  },
  getEggById: async (id: number): Promise<Egg> => {
    const { data } = await apiClient.get(`${egg_url}/${id}`);
    return data;
  },
  createEgg: async (): Promise<Egg> => {
    const { data } = await apiClient.post(`${egg_url}/get_egg`);
    return data;
  },
  startHatching: async (eggId: number): Promise<Egg> => {
    const { data } = await apiClient.post(`${egg_url}/hatch/start`, { eggId });
    return data;
  },
  getHatchingStatus: async (id: number): Promise<UpdatedEgg> => {
    const { data } = await apiClient.get(`${egg_url}/${id}/status`);
    return data;
  },
  hatchEgg: async (id: number): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(`${egg_url}/${id}/open`);
    return data;
  },
  cancelHatching: async (id: number): Promise<Egg> => {
    const { data } = await apiClient.post(`${egg_url}/${id}/cancel`);
    return data;
  },
};
