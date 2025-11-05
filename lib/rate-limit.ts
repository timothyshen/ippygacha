// Simple in-memory rate limiter for API routes
// For production, consider using Redis or a dedicated service

interface RateLimitStore {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store: Map<string, RateLimitStore> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.store.entries()) {
        if (now > value.resetTime) {
          this.store.delete(key);
        }
      }
    }, 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (e.g., IP address, wallet address)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and reset time
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // No entry or expired, create new
    if (!entry || now > entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000), // seconds
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get current stats for debugging
   */
  getStats(): {
    totalKeys: number;
    storeSize: number;
  } {
    return {
      totalKeys: this.store.size,
      storeSize: JSON.stringify(Array.from(this.store.entries())).length,
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Preset rate limit configurations
export const RATE_LIMITS = {
  // Metadata API - 60 requests per minute per IP
  METADATA: {
    limit: 60,
    windowMs: 60 * 1000,
  },
  // User creation/updates - 10 requests per minute per IP
  USER_WRITE: {
    limit: 10,
    windowMs: 60 * 1000,
  },
  // Point awards - 30 requests per minute per wallet
  POINTS: {
    limit: 30,
    windowMs: 60 * 1000,
  },
  // General API - 100 requests per minute per IP
  GENERAL: {
    limit: 100,
    windowMs: 60 * 1000,
  },
  // Strict limit for sensitive operations - 5 requests per minute
  STRICT: {
    limit: 5,
    windowMs: 60 * 1000,
  },
} as const;

/**
 * Get client identifier from request (IP or wallet address)
 */
export function getClientIdentifier(request: Request, useWallet = false): string {
  if (useWallet) {
    // Extract wallet from request body if available
    try {
      const url = new URL(request.url);
      const walletParam = url.searchParams.get('walletAddress');
      if (walletParam) return `wallet:${walletParam}`;
    } catch {
      // Fall through to IP
    }
  }

  // Get IP from headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';

  return `ip:${ip}`;
}

/**
 * Create rate limit response with proper headers
 */
export function createRateLimitResponse(
  message: string,
  resetTime: number,
  retryAfter: number
): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      message,
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  );
}

/**
 * Add rate limit headers to successful response
 */
export function addRateLimitHeaders(
  response: Response,
  remaining: number,
  resetTime: number
): Response {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('X-RateLimit-Remaining', remaining.toString());
  newHeaders.set('X-RateLimit-Reset', new Date(resetTime).toISOString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
