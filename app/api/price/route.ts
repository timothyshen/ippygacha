import { NextResponse } from "next/server";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price";
const IP_TOKEN_ID = "story-2";
const CACHE_DURATION_SECONDS = 600; // 10 minutes

// Server-side cache
let cachedPrice: { price: number; timestamp: number } | null = null;

export async function GET() {
  try {
    // Check server-side cache
    if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION_SECONDS * 1000) {
      return NextResponse.json(
        { price: cachedPrice.price, cached: true },
        {
          headers: {
            "Cache-Control": `public, s-maxage=${CACHE_DURATION_SECONDS}, stale-while-revalidate=${CACHE_DURATION_SECONDS * 2}`,
          },
        }
      );
    }

    const response = await fetch(
      `${COINGECKO_API_URL}?ids=${IP_TOKEN_ID}&vs_currencies=usd`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: CACHE_DURATION_SECONDS },
      }
    );

    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status}`);
      // Return cached price if available, otherwise fallback
      const price = cachedPrice?.price ?? 3;
      return NextResponse.json({ price, fallback: true });
    }

    const data = await response.json();
    const price = data[IP_TOKEN_ID]?.usd;

    if (typeof price !== "number" || isNaN(price)) {
      console.error("Invalid price data from CoinGecko");
      const fallbackPrice = cachedPrice?.price ?? 3;
      return NextResponse.json({ price: fallbackPrice, fallback: true });
    }

    // Update server-side cache
    cachedPrice = { price, timestamp: Date.now() };

    return NextResponse.json(
      { price, cached: false },
      {
        headers: {
          "Cache-Control": `public, s-maxage=${CACHE_DURATION_SECONDS}, stale-while-revalidate=${CACHE_DURATION_SECONDS * 2}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch IP token price:", error);
    const fallbackPrice = cachedPrice?.price ?? 3;
    return NextResponse.json({ price: fallbackPrice, fallback: true });
  }
}
