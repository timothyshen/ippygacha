import { describe, it, expect } from 'vitest';
import {
  getActivityRewards,
  checkLevelUp,
  LEVEL_CONFIG,
  ACTIVITY_REWARDS,
} from '@/lib/points-system';

describe('Points System', () => {
  describe('getActivityRewards', () => {
    it('should return correct rewards for GACHA_PULL', () => {
      const rewards = getActivityRewards('GACHA_PULL');
      expect(rewards.points).toBe(10);
      expect(rewards.xp).toBe(5);
    });

    it('should return correct rewards for BOX_REVEAL', () => {
      const rewards = getActivityRewards('BOX_REVEAL');
      expect(rewards.points).toBe(20);
      expect(rewards.xp).toBe(10);
    });

    it('should return correct rewards for MARKETPLACE_SALE', () => {
      const rewards = getActivityRewards('MARKETPLACE_SALE');
      expect(rewards.points).toBe(50);
      expect(rewards.xp).toBe(25);
    });

    it('should return zero rewards for invalid activity type', () => {
      const rewards = getActivityRewards('INVALID_TYPE' as any);
      expect(rewards.points).toBe(0);
      expect(rewards.xp).toBe(0);
    });
  });

  describe('checkLevelUp', () => {
    it('should return false if no level up', () => {
      const result = checkLevelUp(50, 80);
      expect(result).toBe(false);
    });

    it('should return true when leveling up from 1 to 2', () => {
      const result = checkLevelUp(90, 110);
      expect(result).toBe(true);
    });

    it('should return true when crossing level threshold', () => {
      const result = checkLevelUp(95, 105);
      expect(result).toBe(true);
    });

    it('should return false when staying in same level', () => {
      const result = checkLevelUp(50, 80);
      expect(result).toBe(false);
    });

    it('should handle multiple level jumps', () => {
      const result = checkLevelUp(0, 500);
      expect(result).toBe(true);
    });
  });

  describe('LEVEL_CONFIG', () => {
    describe('getLevelFromXp', () => {
      it('should return level 1 for 0 XP', () => {
        const info = LEVEL_CONFIG.getLevelFromXp(0);
        expect(info.level).toBe(1);
        expect(info.currentXp).toBe(0);
        expect(info.xpForNextLevel).toBe(100);
      });

      it('should return level 2 for 100+ XP', () => {
        const info = LEVEL_CONFIG.getLevelFromXp(150);
        expect(info.level).toBe(2);
        expect(info.currentXp).toBe(50);
        expect(info.xpForNextLevel).toBe(150);
      });

      it('should calculate progress percentage correctly', () => {
        const info = LEVEL_CONFIG.getLevelFromXp(50);
        expect(info.level).toBe(1);
        expect(info.progressPercentage).toBe(50); // 50/100 = 50%
      });

      it('should handle high level XP', () => {
        const info = LEVEL_CONFIG.getLevelFromXp(10000);
        expect(info.level).toBeGreaterThan(10);
        expect(info.currentXp).toBeGreaterThanOrEqual(0);
        expect(info.progressPercentage).toBeGreaterThanOrEqual(0);
        expect(info.progressPercentage).toBeLessThanOrEqual(100);
      });

      it('should cap at max level', () => {
        const info = LEVEL_CONFIG.getLevelFromXp(1000000);
        expect(info.level).toBe(LEVEL_CONFIG.maxLevel);
      });
    });

    describe('getXpForLevel', () => {
      it('should return 0 for level 1', () => {
        const xp = LEVEL_CONFIG.getXpForLevel(1);
        expect(xp).toBe(0);
      });

      it('should return correct XP for level 2', () => {
        const xp = LEVEL_CONFIG.getXpForLevel(2);
        expect(xp).toBe(100);
      });

      it('should increase XP requirements for higher levels', () => {
        const level2Xp = LEVEL_CONFIG.getXpForLevel(2);
        const level3Xp = LEVEL_CONFIG.getXpForLevel(3);
        const level4Xp = LEVEL_CONFIG.getXpForLevel(4);

        expect(level3Xp).toBeGreaterThan(level2Xp);
        expect(level4Xp).toBeGreaterThan(level3Xp);
      });

      it('should return max XP for levels beyond max', () => {
        const maxXp = LEVEL_CONFIG.getXpForLevel(LEVEL_CONFIG.maxLevel);
        const beyondMaxXp = LEVEL_CONFIG.getXpForLevel(LEVEL_CONFIG.maxLevel + 10);
        expect(beyondMaxXp).toBe(maxXp);
      });
    });

    describe('getRewardMultiplier', () => {
      it('should return 1.0 for level 1', () => {
        const multiplier = LEVEL_CONFIG.getRewardMultiplier(1);
        expect(multiplier).toBe(1.0);
      });

      it('should increase multiplier for higher levels', () => {
        const level1 = LEVEL_CONFIG.getRewardMultiplier(1);
        const level5 = LEVEL_CONFIG.getRewardMultiplier(5);
        const level10 = LEVEL_CONFIG.getRewardMultiplier(10);

        expect(level5).toBeGreaterThan(level1);
        expect(level10).toBeGreaterThan(level5);
      });

      it('should cap multiplier at max level', () => {
        const maxMultiplier = LEVEL_CONFIG.getRewardMultiplier(LEVEL_CONFIG.maxLevel);
        const beyondMaxMultiplier = LEVEL_CONFIG.getRewardMultiplier(
          LEVEL_CONFIG.maxLevel + 10
        );
        expect(beyondMaxMultiplier).toBe(maxMultiplier);
      });
    });
  });

  describe('ACTIVITY_REWARDS', () => {
    it('should have rewards for all activity types', () => {
      const activityTypes = [
        'GACHA_PULL',
        'BOX_REVEAL',
        'RAFFLE_DRAW',
        'MARKETPLACE_TRADE',
        'MARKETPLACE_LIST',
        'MARKETPLACE_SALE',
        'MARKETPLACE_PURCHASE',
      ];

      activityTypes.forEach((type) => {
        const reward = ACTIVITY_REWARDS[type];
        expect(reward).toBeDefined();
        expect(reward.points).toBeGreaterThan(0);
        expect(reward.xp).toBeGreaterThan(0);
      });
    });

    it('should have higher rewards for more valuable actions', () => {
      const gachaPull = ACTIVITY_REWARDS.GACHA_PULL;
      const marketplaceSale = ACTIVITY_REWARDS.MARKETPLACE_SALE;

      expect(marketplaceSale.points).toBeGreaterThan(gachaPull.points);
      expect(marketplaceSale.xp).toBeGreaterThan(gachaPull.xp);
    });
  });
});
