// Marketplace event cache manager

import {
  MarketplaceEventCache,
  SerializedEventCache,
  CachedListing,
  SerializedListing,
  getCacheKey,
} from './types';

const CACHE_VERSION = 1;
const CACHE_KEY = 'marketplace_event_cache_v1';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export class MarketplaceEventCacheManager {
  private cache: MarketplaceEventCache | null = null;

  /**
   * Load cache from localStorage
   */
  loadCache(): MarketplaceEventCache | null {
    // Server-side rendering guard
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (!stored) {
        return null;
      }

      const parsed: SerializedEventCache = JSON.parse(stored);

      // Version check
      if (parsed.version !== CACHE_VERSION) {
        this.clearCache();
        return null;
      }

      // Expiry check
      const age = Date.now() - parsed.updatedAt;
      if (age > CACHE_EXPIRY_MS) {
        this.clearCache();
        return null;
      }

      // Deserialize
      const cache: MarketplaceEventCache = {
        activeListings: new Map(
          Object.entries(parsed.activeListings).map(([key, listing]) => [
            key,
            this.deserializeListing(listing),
          ])
        ),
        soldItems: new Set(parsed.soldItems),
        canceledItems: new Set(parsed.canceledItems),
        lastScannedBlock: BigInt(parsed.lastScannedBlock),
        updatedAt: parsed.updatedAt,
        version: parsed.version,
      };

      this.cache = cache;
      return cache;
    } catch (error) {
      console.error('Failed to load event cache:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Save cache to localStorage
   */
  saveCache(cache: MarketplaceEventCache): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const serialized: SerializedEventCache = {
        activeListings: Object.fromEntries(
          Array.from(cache.activeListings.entries()).map(([key, listing]) => [
            key,
            this.serializeListing(listing),
          ])
        ),
        soldItems: Array.from(cache.soldItems),
        canceledItems: Array.from(cache.canceledItems),
        lastScannedBlock: cache.lastScannedBlock.toString(),
        updatedAt: cache.updatedAt,
        version: cache.version,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(serialized));
      this.cache = cache;
    } catch (error) {
      console.error('Failed to save event cache:', error);
      // If quota exceeded, clear cache and try again with empty cache
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old cache');
        this.clearCache();
      }
    }
  }

  /**
   * Clear cache from localStorage
   */
  clearCache(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(CACHE_KEY);
      this.cache = null;
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Initialize empty cache
   */
  initEmptyCache(startBlock: bigint = BigInt(0)): MarketplaceEventCache {
    return {
      activeListings: new Map(),
      soldItems: new Set(),
      canceledItems: new Set(),
      lastScannedBlock: startBlock,
      updatedAt: Date.now(),
      version: CACHE_VERSION,
    };
  }

  /**
   * Get cache stats for debugging
   */
  getCacheStats(): {
    activeListings: number;
    soldItems: number;
    canceledItems: number;
    lastScannedBlock: string;
    cacheAge: number;
    cacheSizeKB: number;
  } | null {
    const cache = this.cache || this.loadCache();
    if (!cache) {
      return null;
    }

    const serialized = JSON.stringify({
      activeListings: Object.fromEntries(cache.activeListings),
      soldItems: Array.from(cache.soldItems),
      canceledItems: Array.from(cache.canceledItems),
    });

    return {
      activeListings: cache.activeListings.size,
      soldItems: cache.soldItems.size,
      canceledItems: cache.canceledItems.size,
      lastScannedBlock: cache.lastScannedBlock.toString(),
      cacheAge: Date.now() - cache.updatedAt,
      cacheSizeKB: Math.round((serialized.length * 2) / 1024), // UTF-16 = 2 bytes per char
    };
  }

  // Private helper methods

  private serializeListing(listing: CachedListing): SerializedListing {
    return {
      nftAddress: listing.nftAddress,
      tokenId: listing.tokenId,
      price: listing.price,
      seller: listing.seller,
      blockNumber: listing.blockNumber.toString(),
      transactionHash: listing.transactionHash,
    };
  }

  private deserializeListing(listing: SerializedListing): CachedListing {
    return {
      nftAddress: listing.nftAddress,
      tokenId: listing.tokenId,
      price: listing.price,
      seller: listing.seller,
      blockNumber: BigInt(listing.blockNumber),
      transactionHash: listing.transactionHash,
    };
  }
}

// Export singleton instance
export const marketplaceCache = new MarketplaceEventCacheManager();
