import { RarityType } from "../enums";

export type TraitType =
  // Common (5) — прості, часто зустрічаються
  | "lazy" // ледачий
  | "glutton" // ненажера
  | "messy" // неохайний
  | "shy" // сором'язливий
  | "energetic" // енергійний

  // Uncommon (4) — трохи рідші, більш виражені ефекти
  | "playful" // грайливий
  | "curious" // цікавий
  | "stubborn" // впертий
  | "fragile" // крихкий

  // Rare (4) — рідкісні, сильніший вплив
  | "hyperactive" // гіперактивний
  | "antisocial" // нетовариський
  | "hardy" // витривалий
  | "wild" // дикий

  // Epic (4) — епічні, яскраві ефекти
  | "brave" // хоробрий
  | "loyal" // вірний
  | "childish" // дитячий
  | "pessimist" // песиміст

  // Mythic (2) — дуже рідкісні, потужні чи небезпечні
  | "optimist" // оптиміст
  | "athlete" // атлет

  // Legendary (1) — унікальний, визначний
  | "immortal_soul"; // безсмертна душа

export interface TraitEffect {
  trait: TraitType;
  rarity: RarityType;
  isNegative: boolean; // чи трейт загалом шкідливий
  description: string;
  effects: {
    hunger_rate?: number; // множник швидкості голоду (>1 = швидше голодніє)
    energy_drain?: number; // множник витрати енергії  (>1 = швидше втомлюється)
    happiness_gain?: number; // множник приросту щастя   (<1 = важче радіє)
    cleanliness_decay?: number; // множник забруднення      (>1 = швидше бруднішає)
    health_modifier?: number; // множник базового здоров'я (>1 = міцніший)
    sleep_requirement?: number; // множник потреби в сні
    play_requirement?: number; // множник потреби в іграх
  };
}
