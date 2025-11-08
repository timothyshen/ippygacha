// Event caching types for marketplace

export interface MarketplaceEventCache {
  // Active listings (not sold or canceled)
  activeListings: Map<string, CachedListing>;

  // Last scanned block number
  lastScannedBlock: bigint;

  // Cache metadata
  updatedAt: number;
  version: number;
}

export interface CachedListing {
  nftAddress: string;
  tokenId: string;
  price: string;
  seller: string;
  blockNumber: bigint;
  transactionHash: string;
}

// Serialized version for localStorage
export interface SerializedEventCache {
  activeListings: Record<string, SerializedListing>;
  lastScannedBlock: string;
  updatedAt: number;
  version: number;
}

export interface SerializedListing {
  nftAddress: string;
  tokenId: string;
  price: string;
  seller: string;
  blockNumber: string;
  transactionHash: string;
}

// Helper to create cache key
export function getCacheKey(nftAddress: string, tokenId: string | bigint): string {
  const tokenIdStr = typeof tokenId === 'bigint' ? tokenId.toString() : tokenId;
  return `${nftAddress.toLowerCase()}:${tokenIdStr}`;
}
