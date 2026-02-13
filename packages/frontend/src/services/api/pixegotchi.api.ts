import { apiClient } from "../client";
import {
  PixegotchiStatus,
  PixegotchiGender,
  ElementType,
  RarityType,
} from "../../../../backend/generated/prisma/enums";

export interface Pixegotchi {
  id: number | null;
  userId: number | null;
  nftAddress: string | null;
  genomeHash: string | null;
  element: ElementType | null;
  rarity: RarityType | null;
  gender: PixegotchiGender | null;
  name: string | null;
  status: PixegotchiStatus | null;
  level: number | null;
  experience: number | null;
  health: number | null;
  hunger: number | null;
  energy: number | null;
  happiness: number | null;
  cleanliness: number | null;
  criticalSince: Date | null;
  lastFedAt: Date | null;
  lastPlayedAt: Date | null;
  lastSleptAt: Date | null;
  lastCleanedAt: Date | null;
  lastHealedAt: Date | null;
  lastUpdateAt: Date | null;
  createdAt: Date | null;
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
