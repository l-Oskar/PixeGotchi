import type { Pixegotchi } from "./pixegotchi";

export interface User {
  id: number;
  telegramId: string;
  walletAddress: string | null;
  username: string | null;
  pgcBalance: string;
  lastActiveAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UserProfile extends User {
  pixegotchis: Pixegotchi[];
}
