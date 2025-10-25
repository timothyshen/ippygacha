import { ActivityType } from "./activity-types";

// Points and XP rewards for different activities
export const ACTIVITY_REWARDS: Record<ActivityType, { points: number; xp: number }> = {
  GACHA_PULL: { points: 10, xp: 5 },
  BOX_REVEAL: { points: 15, xp: 8 },
  MARKETPLACE_TRADE: { points: 20, xp: 10 },
  RAFFLE_DRAW: { points: 25, xp: 15 },
  MARKETPLACE_LIST: { points: 5, xp: 3 },
  MARKETPLACE_SALE: { points: 20, xp: 10 },
  MARKETPLACE_PURCHASE: { points: 10, xp: 5 },
};

// Level system configuration
export const LEVEL_CONFIG = {
  // XP required for each level
  getXpForLevel: (level: number): number => {
    if (level <= 10) return 100;
    if (level <= 25) return 200;
    if (level <= 50) return 300;
    return 500;
  },

  // Calculate level from total XP
  getLevelFromXp: (
    totalXp: number
  ): { level: number; xpToNext: number; currentLevelXp: number } => {
    let level = 1;
    let xpUsed = 0;

    while (xpUsed + LEVEL_CONFIG.getXpForLevel(level) <= totalXp) {
      xpUsed += LEVEL_CONFIG.getXpForLevel(level);
      level++;
    }

    const xpToNext = LEVEL_CONFIG.getXpForLevel(level) - (totalXp - xpUsed);
    const currentLevelXp = totalXp - xpUsed;

    return { level, xpToNext, currentLevelXp };
  },
};

// Helper function to get rewards for an activity
export function getActivityRewards(activityType: ActivityType) {
  return ACTIVITY_REWARDS[activityType] || { points: 0, xp: 0 };
}

// Helper function to check if user leveled up
export function checkLevelUp(oldXp: number, newXp: number): boolean {
  const oldLevel = LEVEL_CONFIG.getLevelFromXp(oldXp).level;
  const newLevel = LEVEL_CONFIG.getLevelFromXp(newXp).level;
  return newLevel > oldLevel;
}
