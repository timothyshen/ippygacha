import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketplaceEventCacheManager } from '@/lib/events/cache';
import { getCacheKey } from '@/lib/events/types';
import type { MarketplaceEventCache } from '@/lib/events/types';

describe('MarketplaceEventCacheManager', () => {
  let cacheManager: MarketplaceEventCacheManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    cacheManager = new MarketplaceEventCacheManager();
  });

  describe('initEmptyCache', () => {
    it('should create empty cache with correct structure', () => {
      const cache = cacheManager.initEmptyCache();

      expect(cache.activeListings).toBeInstanceOf(Map);
      expect(cache.activeListings.size).toBe(0);
      expect(cache.soldItems).toBeInstanceOf(Set);
      expect(cache.soldItems.size).toBe(0);
      expect(cache.canceledItems).toBeInstanceOf(Set);
      expect(cache.canceledItems.size).toBe(0);
      expect(cache.lastScannedBlock).toBe(BigInt(0));
      expect(cache.version).toBe(1);
      expect(cache.updatedAt).toBeGreaterThan(0);
    });
  });

  describe('saveCache and loadCache', () => {
    it('should save and load cache correctly', () => {
      const cache = cacheManager.initEmptyCache();
      cache.activeListings.set('0xabc:1', {
        nftAddress: '0xabc',
        tokenId: BigInt(1),
        price: BigInt(1000),
        seller: '0xdef',
        blockNumber: BigInt(100),
        timestamp: Date.now(),
      });
      cache.lastScannedBlock = BigInt(200);

      cacheManager.saveCache(cache);

      const loaded = cacheManager.loadCache();
      expect(loaded).not.toBeNull();
      expect(loaded!.activeListings.size).toBe(1);
      expect(loaded!.lastScannedBlock).toBe(BigInt(200));
      expect(loaded!.activeListings.get('0xabc:1')?.price).toBe(BigInt(1000));
    });

    it('should return null if no cache exists', () => {
      const loaded = cacheManager.loadCache();
      expect(loaded).toBeNull();
    });

    it('should return null if cache version mismatch', () => {
      // Save cache with wrong version
      localStorage.setItem(
        'marketplace-event-cache',
        JSON.stringify({
          version: 999,
          activeListings: {},
          soldItems: [],
          canceledItems: [],
          lastScannedBlock: '0',
          updatedAt: Date.now(),
        })
      );

      const loaded = cacheManager.loadCache();
      expect(loaded).toBeNull();
      // Cache should be cleared
      expect(localStorage.getItem('marketplace-event-cache')).toBeNull();
    });

    it('should return null if cache expired', () => {
      const cache = cacheManager.initEmptyCache();
      // Set updatedAt to 10 minutes ago (cache expires after 5 min)
      cache.updatedAt = Date.now() - 10 * 60 * 1000;

      cacheManager.saveCache(cache);

      const loaded = cacheManager.loadCache();
      expect(loaded).toBeNull();
    });
  });

  describe('clearCache', () => {
    it('should remove cache from localStorage', () => {
      const cache = cacheManager.initEmptyCache();
      cacheManager.saveCache(cache);

      expect(localStorage.getItem('marketplace-event-cache')).not.toBeNull();

      cacheManager.clearCache();

      expect(localStorage.getItem('marketplace-event-cache')).toBeNull();
    });
  });

  describe('getCacheStats', () => {
    it('should return null if no cache exists', () => {
      const stats = cacheManager.getCacheStats();
      expect(stats).toBeNull();
    });

    it('should return correct stats', () => {
      const cache = cacheManager.initEmptyCache();
      cache.activeListings.set('0xabc:1', {
        nftAddress: '0xabc',
        tokenId: BigInt(1),
        price: BigInt(1000),
        seller: '0xdef',
        blockNumber: BigInt(100),
        timestamp: Date.now(),
      });
      cache.soldItems.add('0xabc:2');
      cache.soldItems.add('0xabc:3');
      cache.canceledItems.add('0xabc:4');

      cacheManager.saveCache(cache);

      const stats = cacheManager.getCacheStats();
      expect(stats).not.toBeNull();
      expect(stats!.activeListings).toBe(1);
      expect(stats!.soldItems).toBe(2);
      expect(stats!.canceledItems).toBe(1);
      expect(stats!.lastScannedBlock).toBe('0');
      expect(stats!.cacheSizeKB).toBeGreaterThan(0);
      expect(stats!.cacheAge).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('getCacheKey', () => {
  it('should create consistent key for address and tokenId', () => {
    const key1 = getCacheKey('0xABC123', '1');
    const key2 = getCacheKey('0xabc123', BigInt(1));

    expect(key1).toBe(key2);
    expect(key1).toBe('0xabc123:1');
  });

  it('should handle different tokenId formats', () => {
    const key1 = getCacheKey('0xabc', '123');
    const key2 = getCacheKey('0xabc', BigInt(123));

    expect(key1).toBe(key2);
  });

  it('should normalize address to lowercase', () => {
    const key = getCacheKey('0xABCDEF', '1');
    expect(key).toBe('0xabcdef:1');
  });
});
