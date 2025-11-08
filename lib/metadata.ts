// Metadata fetching and caching utilities for IPPY NFTs and Blind Boxes

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  background_color?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  // Additional fields for enhanced display
  tokenId?: number;
  nftType?: number;
  rarity?: string;
  theme?: string;
}

export interface BlindBoxMetadata extends NFTMetadata {
  svg?: string; // Extracted SVG for display
  isOnChain: true;
}

export interface MetadataCache {
  [key: string]: {
    metadata: NFTMetadata;
    timestamp: number;
    expires: number;
  };
}

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;
const CACHE_KEY = "ippy_metadata_cache";

const decodeBase64String = (value: string): string => {
  if (typeof atob === "function") {
    return atob(value);
  }

  const nodeBuffer = (globalThis as typeof globalThis & { Buffer?: any })
    .Buffer;

  if (nodeBuffer) {
    return nodeBuffer.from(value, "base64").toString("utf-8");
  }

  throw new Error("Base64 decoding not supported in this environment");
};

class MetadataService {
  private cache: MetadataCache = {};
  // Request deduplication: track in-flight requests
  private inFlightRequests: Map<string, Promise<{ metadata: NFTMetadata; cachedUrl: string } | null>> = new Map();
  // Batching: collect requests over a time window
  private requestQueue: Array<{
    tokenId: number;
    ippyNFTAddress: string;
    resolve: (value: { metadata: NFTMetadata; cachedUrl: string } | null) => void;
    reject: (error: any) => void;
  }> = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly BATCH_WINDOW = 50; // 50ms batching window

  constructor() {
    this.loadCache();
  }

  // Load cache from localStorage
  private loadCache() {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          this.cache = JSON.parse(cached);
          // Clean expired entries
          this.cleanExpiredCache();
        }
      } catch (error) {
        console.warn("Failed to load metadata cache:", error);
        this.cache = {};
      }
    }
  }

  // Save cache to localStorage
  private saveCache() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
      } catch (error) {
        console.warn("Failed to save metadata cache:", error);
      }
    }
  }

  // Clean expired cache entries
  private cleanExpiredCache() {
    const now = Date.now();
    Object.keys(this.cache).forEach((key) => {
      if (this.cache[key].expires < now) {
        delete this.cache[key];
      }
    });
  }

  // Get from cache if not expired
  private getFromCache(key: string): NFTMetadata | null {
    const cached = this.cache[key];
    if (cached && cached.expires > Date.now()) {
      return cached.metadata;
    }
    return null;
  }

  // Store in cache
  private setCache(key: string, metadata: NFTMetadata) {
    this.cache[key] = {
      metadata,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_DURATION,
    };
    this.saveCache();
  }

  // Parse base64 encoded JSON metadata (for blind boxes)
  private parseBase64Metadata(dataUri: string): BlindBoxMetadata | null {
    try {
      // Extract base64 part from data URI
      const base64Match = dataUri.match(/data:application\/json;base64,(.+)/);
      if (!base64Match) {
        throw new Error("Invalid data URI format");
      }

      // Decode base64
      let jsonString = decodeBase64String(base64Match[1]);

      // Fix common JSON issues
      jsonString = fixMalformedJson(jsonString);

      const metadata = JSON.parse(jsonString) as NFTMetadata;

      // Extract SVG if it's a data URI
      let svg: string | undefined;
      if (metadata.image?.startsWith("data:image/svg+xml;base64,")) {
        const svgBase64 = metadata.image.split(",")[1];
        svg = decodeBase64String(svgBase64);
      }

      return {
        ...metadata,
        svg,
        isOnChain: true,
      } as BlindBoxMetadata;
    } catch (error) {
      console.error("Failed to parse base64 metadata:", error);
      return null;
    }
  }

  // Fetch JSON metadata from URL (for IPPY NFTs)
  private async fetchJsonMetadata(url: string): Promise<NFTMetadata | null> {
    try {
      // Add cache busting and timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Cache-Control": "max-age=3600", // 1 hour cache
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metadata = await response.json();

      // Validate required fields
      if (!metadata.name || !metadata.description) {
        throw new Error("Invalid metadata: missing required fields");
      }

      return metadata as NFTMetadata;
    } catch (error) {
      console.error(`Failed to fetch metadata from ${url}:`, error);
      return null;
    }
  }

  // Process the batch queue
  private async processBatchQueue() {
    if (this.requestQueue.length === 0) return;

    // Take all pending requests
    const requests = [...this.requestQueue];
    this.requestQueue = [];
    this.batchTimer = null;

    // Group by unique (tokenId, address) pairs
    const uniqueRequests = new Map<string, typeof requests[0][]>();

    requests.forEach((req) => {
      const key = `${req.ippyNFTAddress}_${req.tokenId}`;
      if (!uniqueRequests.has(key)) {
        uniqueRequests.set(key, []);
      }
      uniqueRequests.get(key)!.push(req);
    });

    console.log(`[MetadataService] Processing batch: ${uniqueRequests.size} unique requests from ${requests.length} total requests`);

    // Fetch all unique requests
    const fetchPromises = Array.from(uniqueRequests.entries()).map(
      async ([key, requestGroup]) => {
        const { tokenId, ippyNFTAddress } = requestGroup[0];

        try {
          const url = `/api/metadata?contractAddress=${ippyNFTAddress}&tokenId=${tokenId}`;
          const response = await fetch(url, {
            method: "GET",
            headers: { "Accept": "application/json" },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data.raw?.metadata || !data.image?.cachedUrl) {
            throw new Error("Invalid metadata response structure");
          }

          const result = {
            metadata: data.raw.metadata,
            cachedUrl: data.image.cachedUrl,
          };

          // Resolve all requests for this token
          requestGroup.forEach((req) => req.resolve(result));

          return result;
        } catch (error) {
          console.error(`Failed to fetch metadata for token ${tokenId}:`, error);
          // Reject all requests for this token
          requestGroup.forEach((req) => req.reject(error));
          return null;
        }
      }
    );

    await Promise.allSettled(fetchPromises);
  }

  // Main function to get NFT metadata (with deduplication)
  async getIPPYMetadata(
    tokenId: number,
    ippyNFTAddress: string
  ): Promise<{ metadata: NFTMetadata; cachedUrl: string } | null> {
    const requestKey = `${ippyNFTAddress}_${tokenId}`;

    // Check if request is already in-flight
    const inFlight = this.inFlightRequests.get(requestKey);
    if (inFlight) {
      console.log(`[MetadataService] Deduplicating request for token ${tokenId}`);
      return inFlight;
    }

    // Create new request promise
    const requestPromise = new Promise<{ metadata: NFTMetadata; cachedUrl: string } | null>(
      (resolve, reject) => {
        // Add to queue
        this.requestQueue.push({ tokenId, ippyNFTAddress, resolve, reject });

        // Schedule batch processing
        if (!this.batchTimer) {
          this.batchTimer = setTimeout(() => {
            this.processBatchQueue();
          }, this.BATCH_WINDOW);
        }
      }
    );

    // Track in-flight request
    this.inFlightRequests.set(requestKey, requestPromise);

    // Clean up after completion
    requestPromise.finally(() => {
      this.inFlightRequests.delete(requestKey);
    });

    return requestPromise;
  }

  // Get blind box metadata (always on-chain)
  async getBlindBoxMetadata(uri: string): Promise<BlindBoxMetadata | null> {
    const cacheKey = `blindbox_${uri}`;

    // Check cache first
    const cached = this.getFromCache(cacheKey) as BlindBoxMetadata | null;
    if (cached) {
      return cached;
    }

    try {
      const metadata = this.parseBase64Metadata(uri);
      if (metadata) {
        // Cache the result
        this.setCache(cacheKey, metadata);
        return metadata;
      }
      return null;
    } catch (error) {
      console.error("Error parsing blind box metadata:", error);
      return null;
    }
  }

  // Batch fetch multiple NFT metadata
  // Now leverages automatic deduplication and batching from getIPPYMetadata
  async batchGetIPPYMetadata(
    nfts: Array<{ tokenId: number; ippyNFTAddress: string }>
  ): Promise<Array<NFTMetadata | null>> {
    console.log(`[MetadataService] Batch request for ${nfts.length} NFTs`);

    // Simply call getIPPYMetadata for each - they will be automatically batched
    // within the BATCH_WINDOW and deduplicated if there are duplicates
    const promises = nfts.map((nft) =>
      this.getIPPYMetadata(nft.tokenId, nft.ippyNFTAddress)
    );

    const results = await Promise.allSettled(promises);

    return results.map((result) => {
      if (result.status === "fulfilled" && result.value) {
        return result.value.metadata;
      }
      return null;
    });
  }

  // Clear cache manually
  clearCache() {
    this.cache = {};
    if (typeof window !== "undefined") {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // Get cache stats
  getCacheStats() {
    const now = Date.now();
    const entries = Object.keys(this.cache);
    const valid = entries.filter((key) => this.cache[key].expires > now);

    return {
      totalEntries: entries.length,
      validEntries: valid.length,
      expiredEntries: entries.length - valid.length,
      cacheSize: JSON.stringify(this.cache).length,
      inFlightRequests: this.inFlightRequests.size,
      queuedRequests: this.requestQueue.length,
      batchTimerActive: this.batchTimer !== null,
    };
  }

  // Get request queue info (for debugging)
  getQueueInfo() {
    return {
      inFlight: Array.from(this.inFlightRequests.keys()),
      queued: this.requestQueue.map((req) => ({
        tokenId: req.tokenId,
        address: req.ippyNFTAddress,
      })),
      batchScheduled: this.batchTimer !== null,
    };
  }
}

// Export singleton instance
export const metadataService = new MetadataService();

// Utility functions for components
export const isIPFSUrl = (url: string): boolean => {
  return url.includes("ipfs") || url.startsWith("ipfs://");
};

export const getImageDisplayUrl = (imageUrl: string): string => {
  // Handle IPFS URLs - convert to gateway URL if needed
  if (imageUrl.startsWith("ipfs://")) {
    return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return imageUrl;
};

export const getMetadataDisplayName = (metadata: NFTMetadata): string => {
  return metadata.name || `NFT #${metadata.tokenId}`;
};

export const getMetadataDescription = (metadata: NFTMetadata): string => {
  return metadata.description || "No description available";
};

export const getRarityColor = (rarity?: string): string => {
  const colors = {
    hidden: "from-purple-500 to-pink-500",
    legendary: "from-yellow-400 to-orange-500",
    epic: "from-purple-400 to-indigo-500",
    rare: "from-blue-400 to-cyan-500",
    standard: "from-gray-400 to-gray-500",
  };
  return colors[rarity as keyof typeof colors] || colors.standard;
};

// Utility function to manually decode base64 metadata (for debugging)
export const decodeBase64Metadata = (dataUri: string): NFTMetadata | null => {
  try {
    // Extract base64 part from data URI
    const base64Match = dataUri.match(/data:application\/json;base64,(.+)/);
    if (!base64Match) {
      throw new Error("Invalid data URI format");
    }

    // Decode base64
    let jsonString = decodeBase64String(base64Match[1]);

    // Fix common JSON issues
    jsonString = fixMalformedJson(jsonString);

    const metadata = JSON.parse(jsonString) as NFTMetadata;

    return metadata;
  } catch (error) {
    console.error("Failed to decode base64 metadata:", error);
    return null;
  }
};

// Helper function to fix common JSON malformation issues
const fixMalformedJson = (jsonString: string): string => {
  // Fix the specific issue: missing closing quote before ]}
  // Pattern: "Arcade Surge}]} -> "Arcade Surge"}]}
  jsonString = jsonString.replace(/([^"]*)"\]\}/g, '$1"}]}');

  return jsonString;
};
