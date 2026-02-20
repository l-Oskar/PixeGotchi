export enum ItemEffectType {
  RESTORE_HUNGER = "restore_hunger",
  RESTORE_HEALTH = "restore_health",
  RESTORE_ENERGY = "restore_energy",
  RESTORE_HAPPINESS = "restore_happiness",
  RESTORE_CLEANLINESS = "restore_cleanliness",

  BOOST_EXPERIENCE = "boost_experience",

  REVIVE = "revive",
  PREVENT_DISEASE = "prevent_disease",
  BOOST_ALL_STATS = "boost_all_stats",
  RANDOM_STAT_BOOST = "random_stat_boost",

  DRAIN_ENERGY = "drain_energy",
  INCREASE_HUNGER = "increase_hunger",

  TEMPORARY_BUFF = "temporary_buff",
  PERMANENT_BUFF = "permanent_buff",
}

export type ItemEffects = {
  [key in ItemEffectType]?: number;
} & {
  [key: string]: number | undefined;
};
