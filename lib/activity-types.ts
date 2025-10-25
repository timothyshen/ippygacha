export const ACTIVITY_TYPES = [
  "GACHA_PULL",
  "BOX_REVEAL",
  "RAFFLE_DRAW",
  "MARKETPLACE_TRADE",
  "MARKETPLACE_LIST",
  "MARKETPLACE_SALE",
  "MARKETPLACE_PURCHASE",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const ACTIVITY_TYPE_SET = new Set<string>(ACTIVITY_TYPES);

export function isActivityType(value: string | null | undefined): value is ActivityType {
  if (!value) return false;
  return ACTIVITY_TYPE_SET.has(value);
}
