import { useState, useEffect } from "react";
import { getIPTokenPrice, getIPTokenPriceSync } from "@/lib/price";

/**
 * Hook to get the current IP token price in USD
 * - Fetches price on mount
 * - Returns cached/fallback price immediately for fast initial render
 * - Updates when fresh price is fetched
 */
export function useIPPrice() {
  const [price, setPrice] = useState<number>(getIPTokenPriceSync());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchPrice = async () => {
      try {
        const newPrice = await getIPTokenPrice();
        if (mounted) {
          setPrice(newPrice);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPrice();

    return () => {
      mounted = false;
    };
  }, []);

  return { price, isLoading };
}
