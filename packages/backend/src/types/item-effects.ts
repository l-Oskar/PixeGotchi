// Re-exported from @pixegotchi/shared — types are now defined there
// so both frontend and backend can import from the same place.
export type { ItemEffects } from "@pixegotchi/shared";
export { ItemEffectType } from "@pixegotchi/shared";

// ItemEffectConfig remains backend-only (references Prisma's Pixegotchi model)
import type { Pixegotchi } from "generated/prisma/client";

export interface ItemEffectConfig {
  field?: keyof Pixegotchi;
  inverse?: boolean; // віднімати замість додавати
  min?: number; // мінімальне значення
  max?: number; // максимальне значення
  handler?: "special"; // спеціальний обробник
}
