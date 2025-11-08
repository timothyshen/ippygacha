import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  rateLimiter,
  RATE_LIMITS,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  beforeEach(() => {
    // Reset rate limiter state between tests
    rateLimiter.reset('test-client');
  });

  describe('rateLimiter.check', () => {
    it('should allow requests within limit', () => {
      const result = rateLimiter.check('test-client', 5, 60000);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should block requests exceeding limit', () => {
      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        rateLimiter.check('test-client', 5, 60000);
      }

      // 6th request should be blocked
      const result = rateLimiter.check('test-client', 5, 60000);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should decrement remaining count correctly', () => {
      const first = rateLimiter.check('test-client', 10, 60000);
      expect(first.remaining).toBe(9);

      const second = rateLimiter.check('test-client', 10, 60000);
      expect(second.remaining).toBe(8);

      const third = rateLimiter.check('test-client', 10, 60000);
      expect(third.remaining).toBe(7);
    });

    it('should reset after window expires', () => {
      // Make a request with 1ms window
      const first = rateLimiter.check('test-client', 5, 1);
      expect(first.allowed).toBe(true);

      // Wait for window to expire
      return new Promise((resolve) => {
        setTimeout(() => {
          // Should be allowed again
          const second = rateLimiter.check('test-client', 5, 1);
          expect(second.allowed).toBe(true);
          expect(second.remaining).toBe(4);
          resolve(undefined);
        }, 10);
      });
    });

    it('should track different clients separately', () => {
      rateLimiter.check('client-1', 5, 60000);
      rateLimiter.check('client-1', 5, 60000);

      const client1 = rateLimiter.check('client-1', 5, 60000);
      const client2 = rateLimiter.check('client-2', 5, 60000);

      expect(client1.remaining).toBe(2); // 3 requests made
      expect(client2.remaining).toBe(4); // 1 request made
    });
  });

  describe('RATE_LIMITS presets', () => {
    it('should have correct metadata limit', () => {
      expect(RATE_LIMITS.METADATA.limit).toBe(60);
      expect(RATE_LIMITS.METADATA.windowMs).toBe(60000);
    });

    it('should have correct points limit', () => {
      expect(RATE_LIMITS.POINTS.limit).toBe(30);
      expect(RATE_LIMITS.POINTS.windowMs).toBe(60000);
    });

    it('should have correct user write limit', () => {
      expect(RATE_LIMITS.USER_WRITE.limit).toBe(10);
      expect(RATE_LIMITS.USER_WRITE.windowMs).toBe(60000);
    });

    it('should have strict limit for sensitive operations', () => {
      expect(RATE_LIMITS.STRICT.limit).toBe(5);
      expect(RATE_LIMITS.STRICT.windowMs).toBe(60000);
    });
  });

  describe('getClientIdentifier', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
      });

      const clientId = getClientIdentifier(request);
      expect(clientId).toBe('ip:192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-real-ip': '192.168.1.2',
        },
      });

      const clientId = getClientIdentifier(request);
      expect(clientId).toBe('ip:192.168.1.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const request = new Request('http://localhost', {
        headers: {
          'x-forwarded-for': '192.168.1.1',
          'x-real-ip': '192.168.1.2',
        },
      });

      const clientId = getClientIdentifier(request);
      expect(clientId).toBe('ip:192.168.1.1');
    });

    it('should use "unknown" if no IP headers present', () => {
      const request = new Request('http://localhost');
      const clientId = getClientIdentifier(request);
      expect(clientId).toBe('ip:unknown');
    });

    it('should extract wallet from query param when useWallet is true', () => {
      const request = new Request('http://localhost?walletAddress=0xABC123');
      const clientId = getClientIdentifier(request, true);
      expect(clientId).toBe('wallet:0xABC123');
    });
  });

  describe('createRateLimitResponse', () => {
    it('should create 429 response with correct headers', async () => {
      const resetTime = Date.now() + 60000;
      const response = createRateLimitResponse(
        'Too many requests',
        resetTime,
        60
      );

      expect(response.status).toBe(429);
      expect(response.headers.get('Retry-After')).toBe('60');
      expect(response.headers.get('X-RateLimit-Reset')).toBe(
        new Date(resetTime).toISOString()
      );

      const body = await response.json();
      expect(body.error).toBe('Rate limit exceeded');
      expect(body.message).toBe('Too many requests');
      expect(body.retryAfter).toBe(60);
    });
  });

  describe('rateLimiter.getStats', () => {
    it('should return current stats', () => {
      rateLimiter.check('client-1', 5, 60000);
      rateLimiter.check('client-2', 5, 60000);

      const stats = rateLimiter.getStats();
      expect(stats.totalKeys).toBeGreaterThanOrEqual(2);
      expect(stats.storeSize).toBeGreaterThan(0);
    });
  });

  describe('rateLimiter.reset', () => {
    it('should reset specific client limit', () => {
      // Make 4 requests
      for (let i = 0; i < 4; i++) {
        rateLimiter.check('test-client', 5, 60000);
      }

      let result = rateLimiter.check('test-client', 5, 60000);
      expect(result.remaining).toBe(0); // 5th request, no more remaining

      // Reset
      rateLimiter.reset('test-client');

      // Should be allowed again
      result = rateLimiter.check('test-client', 5, 60000);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });
  });
});
