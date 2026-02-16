import { apiClient } from "../client";
import {
  PixegotchiStatus,
  PixegotchiGender,
  ElementType,
  RarityType,
} from "../../../../backend/generated/prisma/enums";

export interface Pixegotchi {
  id: number;
  userId: number;
  nftAddress: string | null;
  genomeHash: string;
  element: ElementType;
  rarity: RarityType;
  gender: PixegotchiGender;
  name: string;
  status: PixegotchiStatus;
  level: number;
  experience: number;
  health: number;
  hunger: number;
  energy: number;
  happiness: number;
  cleanliness: number;
  criticalSince: Date;
  lastFedAt: Date;
  lastPlayedAt: Date;
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
