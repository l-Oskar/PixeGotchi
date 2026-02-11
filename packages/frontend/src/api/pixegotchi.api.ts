import { api } from "./axios";

export interface Pixegotchi {
  id: number;
  name: string;
}

export const getAllPixegotchi = async (): Promise<Pixegotchi[]> => {
  const { data } = await api.get(`/pixegotchi`);
  return data;
};

export const getPixegitchiById = async (id: string): Promise<Pixegotchi> => {
  const { data } = await api.get<Pixegotchi>(`/pixegotchi/${id}`);
  return data;
};

export const getActivePixegotchi = async (): Promise<Pixegotchi> => {
  const { data } = await api.get<Pixegotchi>(`/pixegotchi/active`);
  return data;
};
