import type { Pixegotchi } from "./pixegotchi";

export interface User {
  id: number;
  telegramId: string;
  walletAddress: string | null;
  username: string | null;
  pgcBalance: string;
  lastActiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  pixegotchis: Pixegotchi[];
}
