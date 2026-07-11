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
    game_energy_cost?: number; // множник вартості запуску мініігор
    game_pgc_gain?: number; // множник PGC за мініігри
    game_exp_gain?: number; // множник досвіду за мініігри
    game_chest_chance?: number; // множник шансу скрині за мініігри
    happiness_gain?: number; // множник будь-якого приросту щастя
    feed_happiness_gain?: number; // множник щастя від годування
    play_happiness_gain?: number; // множник щастя від гри
    cleanliness_decay?: number; // множник забруднення      (>1 = швидше бруднішає)
    health_resilience?: number; // стійкість до пасивної втрати здоров'я
    play_requirement?: number; // множник пасивної втрати щастя
  };
  special?: {
    minimumHealth?: number;
  };
}

export type TraitEffectKey = keyof TraitEffect["effects"];
