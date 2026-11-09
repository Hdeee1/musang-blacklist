import { describe, expect, it } from "vitest";
import { getClientIp, getRateLimitHeaders, MemoryRateLimiter } from "@/lib/rate-limit";

describe("Rate Limiting & Security", () => {
  describe("getClientIp", () => {
    it("should prioritize Cloudflare cf-connecting-ip header", () => {
      const headers = new Headers({
        "cf-connecting-ip": "203.0.113.195",
        "x-forwarded-for": "198.51.100.1, 198.51.100.2",
        "x-real-ip": "192.0.2.1",
      });

      expect(getClientIp(headers)).toBe("203.0.113.195");
    });

    it("should extract the first client IP from x-forwarded-for if cf-connecting-ip is absent", () => {
      const headers = new Headers({
        "x-forwarded-for": "198.51.100.42, 10.0.0.1",
        "x-real-ip": "192.0.2.1",
      });

      expect(getClientIp(headers)).toBe("198.51.100.42");
    });

    it("should fall back to x-real-ip if previous headers are absent", () => {
      const headers = new Headers({
        "x-real-ip": "192.0.2.88",
      });

      expect(getClientIp(headers)).toBe("192.0.2.88");
    });

    it("should fall back to 127.0.0.1 if no proxy/client headers are provided", () => {
      const headers = new Headers({});
      expect(getClientIp(headers)).toBe("127.0.0.1");
    });

    it("should work with a plain record object", () => {
      const headersRecord = {
        "x-forwarded-for": "172.16.0.5",
      };

      expect(getClientIp(headersRecord)).toBe("172.16.0.5");
    });
  });

  describe("MemoryRateLimiter", () => {
    it("should allow requests under the limit and track remaining count", () => {
      const limiter = new MemoryRateLimiter({ maxRequests: 3, windowMs: 1000 });
      const key = "test:user:1";

      const res1 = limiter.check(key);
      expect(res1.success).toBe(true);
      expect(res1.limit).toBe(3);
      expect(res1.remaining).toBe(2);

      const res2 = limiter.check(key);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = limiter.check(key);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);
    });

    it("should block requests exceeding the limit and return retryAfter", () => {
      const limiter = new MemoryRateLimiter({ maxRequests: 2, windowMs: 2000 });
      const key = "test:user:blocked";

      limiter.check(key);
      limiter.check(key);

      const blockedRes = limiter.check(key);
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
      expect(blockedRes.retryAfter).toBeGreaterThan(0);
      expect(blockedRes.retryAfter).toBeLessThanOrEqual(2);
    });

    it("should reset rate limits on demand", () => {
      const limiter = new MemoryRateLimiter({ maxRequests: 1, windowMs: 5000 });
      const key = "test:user:reset";

      limiter.check(key);
      const blocked = limiter.check(key);
      expect(blocked.success).toBe(false);

      limiter.reset(key);
      const allowedAfterReset = limiter.check(key);
      expect(allowedAfterReset.success).toBe(true);
    });
  });

  describe("getRateLimitHeaders", () => {
    it("should generate standard X-RateLimit headers", () => {
      const headers = getRateLimitHeaders({
        success: true,
        limit: 60,
        remaining: 59,
        reset: 1730000000,
      });

      expect(headers["X-RateLimit-Limit"]).toBe("60");
      expect(headers["X-RateLimit-Remaining"]).toBe("59");
      expect(headers["X-RateLimit-Reset"]).toBe("1730000000");
      expect(headers["Retry-After"]).toBeUndefined();
    });

    it("should include Retry-After header when limit is exceeded", () => {
      const headers = getRateLimitHeaders({
        success: false,
        limit: 10,
        remaining: 0,
        reset: 1730000060,
        retryAfter: 45,
      });

      expect(headers["X-RateLimit-Limit"]).toBe("10");
      expect(headers["X-RateLimit-Remaining"]).toBe("0");
      expect(headers["Retry-After"]).toBe("45");
    });
  });
});
