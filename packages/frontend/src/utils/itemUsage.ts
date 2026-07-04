import { ItemBuffsType, PixegotchiStatus, type Item } from "@pixegotchi/shared";

export const hasReviveEffect = (item: Item | null | undefined) =>
  Boolean(
    item?.effects?.buffs?.some((buff) => Boolean(buff[ItemBuffsType.REVIVE])),
  );

export const canUseItemForStatus = (
  item: Item | null | undefined,
  status: PixegotchiStatus | null | undefined,
) => {
  if (!item || !status) return false;

  const isReviveItem = hasReviveEffect(item);

  if (status === PixegotchiStatus.active) {
    return !isReviveItem;
  }

  return isReviveItem;
};
