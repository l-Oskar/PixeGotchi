export enum ItemBuffsType {
  ADD_EXPERIENCE = "add_experience",
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

export type ItemBuffs = {
  [key in ItemBuffsType]?: number;
} & {
  [key: string]: number | undefined;
};
