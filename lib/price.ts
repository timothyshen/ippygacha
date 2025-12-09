// IP Token price fetching and caching utility

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const IP_TOKEN_ID = "story-protocol"; // CoinGecko ID for IP token
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes cache
const FALLBACK_PRICE = 3; // Fallback price in USD if API fails

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;
let fetchPromise: Promise<number> | null = null;

/**
 * Fetch IP token price from CoinGecko API
 * - Caches the result for 10 minutes
 * - Returns fallback price if API fails
 * - Deduplicates concurrent requests
 */
export async function getIPTokenPrice(): Promise<number> {
  // Return cached price if still valid
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION_MS) {
    return priceCache.price;
  }

  // If a fetch is already in progress, wait for it
  if (fetchPromise) {
    return fetchPromise;
  }

  // Start new fetch
  fetchPromise = (async () => {
    try {
      const response = await fetch(
        `${COINGECKO_API_URL}?ids=${IP_TOKEN_ID}&vs_currencies=usd`,
        {
          headers: {
            Accept: "application/json",
          },
          // Don't cache at HTTP level since we manage our own cache
          cache: "no-store",
        }
      );

      if (!response.ok) {
        console.warn(`CoinGecko API error: ${response.status}`);
        return getCachedOrFallbackPrice();
      }

      const data = await response.json();
      const price = data[IP_TOKEN_ID]?.usd;

      if (typeof price !== "number" || isNaN(price)) {
        console.warn("Invalid price data from CoinGecko");
        return getCachedOrFallbackPrice();
      }

      // Update cache
      priceCache = {
        price,
        timestamp: Date.now(),
      };

      return price;
    } catch (error) {
      console.error("Failed to fetch IP token price:", error);
      return getCachedOrFallbackPrice();
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

/**
 * Get cached price if available, otherwise return fallback
 */
function getCachedOrFallbackPrice(): number {
  if (priceCache) {
    // Return stale cache if available (better than nothing)
    return priceCache.price;
  }
  return FALLBACK_PRICE;
}

/**
 * Synchronously get the current cached price (or fallback)
 * Use this when you need a price immediately without waiting
 */
export function getIPTokenPriceSync(): number {
  if (priceCache) {
    return priceCache.price;
  }
  return FALLBACK_PRICE;
}

/**
 * Format IP amount to USD string
 */
export function formatIPToUSD(ipAmount: number, price?: number): string {
  const usdPrice = price ?? getIPTokenPriceSync();
  return (ipAmount * usdPrice).toFixed(2);
}
