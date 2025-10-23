import { ActivityType } from "@prisma/client";

// Points and XP rewards for different activities
export const ACTIVITY_REWARDS = {
  [ActivityType.GACHA_PULL]: { points: 10, xp: 5 },
  [ActivityType.BOX_REVEAL]: { points: 15, xp: 8 },
  [ActivityType.MARKETPLACE_TRADE]: { points: 20, xp: 10 },
  [ActivityType.RAFFLE_DRAW]: { points: 25, xp: 15 },
  [ActivityType.MARKETPLACE_LIST]: { points: 5, xp: 3 },
  [ActivityType.MARKETPLACE_SALE]: { points: 20, xp: 10 },
  [ActivityType.MARKETPLACE_PURCHASE]: { points: 10, xp: 5 },
} as const;

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
