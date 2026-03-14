import { apiClient } from "./client";
import { Egg, Pixegotchi, UpdatedEgg, EggHatchingStatus } from "@shared";

interface EggWithBalance extends Egg {
  pgcBalance: string;
}

export const EGG_URL = "/eggs";
export const EGG_URL_KEYS = {
  eggs: EGG_URL,
  id: (id: number | null) => `${EGG_URL}/${id}` as const,
  tap: `${EGG_URL}/tap/batch` as const,
  hatchingEgg: `${EGG_URL}/hatching_egg` as const,
  getEgg: `${EGG_URL}/get_egg` as const,
  hatchStart: `${EGG_URL}/hatch/start` as const,
  hatchingStatus: (id: number | null) => `${EGG_URL}/${id}/status` as const,
  hatchEgg: (id: number | null) => `${EGG_URL}/${id}/open` as const,
  hatchCancel: (id: number | null) => `${EGG_URL}/${id}/cancel` as const,
};

export const eggApi = {
  getAllEggs: async (): Promise<Egg[]> => {
    const { data } = await apiClient.get(EGG_URL_KEYS.eggs);
    return data;
  },
  getEggById: async (id: number): Promise<Egg> => {
    const { data } = await apiClient.get(EGG_URL_KEYS.id(id));
    return data;
  },
  getHatchingEgg: async (): Promise<Egg | null> => {
    const { data } = await apiClient.get(EGG_URL_KEYS.hatchingEgg);
    return data;
  },
  createEgg: async (): Promise<EggWithBalance> => {
    const { data } = await apiClient.post(EGG_URL_KEYS.getEgg);
    return data;
  },
  startHatching: async (eggId: number): Promise<Egg> => {
    const { data } = await apiClient.post(EGG_URL_KEYS.hatchStart, { eggId });
    return data;
  },
  batchTap: async (eggId: number, tapCount: number) => {
    const { data } = await apiClient.post(EGG_URL_KEYS.tap, {
      eggId,
      tapCount,
    });
    return data;
  },
  getHatchingStatus: async (id: number): Promise<EggHatchingStatus> => {
    const { data } = await apiClient.get(EGG_URL_KEYS.hatchingStatus(id));
    return data;
  },
  hatchEgg: async (id: number, name?: string): Promise<Pixegotchi> => {
    const { data } = await apiClient.post(EGG_URL_KEYS.hatchEgg(id), { name });
    return data;
  },
  cancelHatching: async (id: number): Promise<UpdatedEgg> => {
    const { data } = await apiClient.post(EGG_URL_KEYS.hatchCancel(id));
    return data;
  },
};
