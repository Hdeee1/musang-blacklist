/**
 * Rate Limiter Engine & IP Extraction Helper
 * Designed for public search and critical API endpoints.
 * Compatible with Node.js and Next.js Edge/Server runtimes.
 */

export interface RateLimitOptions {
  readonly windowMs: number;
  readonly maxRequests: number;
}

export interface RateLimitResult {
  readonly success: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly reset: number; // Unix timestamp in seconds
  readonly retryAfter?: number; // Seconds to wait until reset
}

export const RATE_LIMIT_TIERS = {
  SEARCH: { maxRequests: 60, windowMs: 60_000 },
  AUTH: { maxRequests: 10, windowMs: 60_000 },
  REPORT: { maxRequests: 10, windowMs: 60_000 },
  GLOBAL: { maxRequests: 120, windowMs: 60_000 },
} as const;

export type RateLimitTier = keyof typeof RATE_LIMIT_TIERS;

interface RateLimitRecord {
  count: number;
  resetTime: number; // Timestamp in milliseconds
}

export class MemoryRateLimiter {
  private readonly store = new Map<string, RateLimitRecord>();
  private readonly defaultWindowMs: number;
  private readonly defaultMaxRequests: number;
  private lastPruneTime: number = Date.now();

  constructor(options?: Partial<RateLimitOptions>) {
    this.defaultWindowMs = options?.windowMs ?? 60_000;
    this.defaultMaxRequests = options?.maxRequests ?? 60;
  }

  public check(key: string, options?: Partial<RateLimitOptions>): RateLimitResult {
    const now = Date.now();
    this.pruneIfNeeded(now);

    const windowMs = options?.windowMs ?? this.defaultWindowMs;
    const maxRequests = options?.maxRequests ?? this.defaultMaxRequests;

    let record = this.store.get(key);

    if (!record || now >= record.resetTime) {
      // First request or window expired
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      this.store.set(key, record);

      return {
        success: true,
        limit: maxRequests,
        remaining: Math.max(0, maxRequests - 1),
        reset: Math.ceil(record.resetTime / 1000),
      };
    }

    record.count += 1;
    const isExceeded = record.count > maxRequests;
    const retryAfter = isExceeded ? Math.ceil((record.resetTime - now) / 1000) : undefined;

    return {
      success: !isExceeded,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - record.count),
      reset: Math.ceil(record.resetTime / 1000),
      ...(retryAfter !== undefined ? { retryAfter } : {}),
    };
  }

  public reset(key?: string): void {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  private pruneIfNeeded(now: number): void {
    // Prune expired records every 60 seconds or if store grows beyond 5000 items
    if (now - this.lastPruneTime < 60_000 && this.store.size < 5000) {
      return;
    }

    this.lastPruneTime = now;
    for (const [key, record] of this.store.entries()) {
      if (now >= record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Global default singleton instance
const envMaxRequests = process.env.RATE_LIMIT_MAX_REQUESTS
  ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10)
  : 60;
const envWindowMs = process.env.RATE_LIMIT_WINDOW_MS
  ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10)
  : 60_000;

export const defaultRateLimiter = new MemoryRateLimiter({
  maxRequests: isNaN(envMaxRequests) ? 60 : envMaxRequests,
  windowMs: isNaN(envWindowMs) ? 60_000 : envWindowMs,
});

/**
 * Normalizes and strips port numbers from IPv4 / IPv6 addresses.
 */
export function sanitizeIp(rawIp: string): string {
  const trimmed = rawIp.trim();

  // IPv6 with brackets and port, e.g. [2001:db8::1]:8080
  if (trimmed.startsWith("[")) {
    const bracketEnd = trimmed.indexOf("]");
    if (bracketEnd !== -1) {
      return trimmed.slice(1, bracketEnd);
    }
  }

  // IPv4 with port, e.g. 192.168.1.1:8080 (must have exactly one colon)
  const colonCount = (trimmed.match(/:/g) || []).length;
  if (colonCount === 1) {
    return trimmed.split(":")[0] ?? trimmed;
  }

  return trimmed;
}

/**
 * Extracts client IP address with priority given to Cloudflare & reverse-proxy headers.
 */
export function getClientIp(
  headers: Headers | Record<string, string | string[] | undefined>,
): string {
  // Cloudflare CF-Connecting-IP
  const cfIp = getHeaderValue(headers, "cf-connecting-ip");
  if (cfIp) return sanitizeIp(cfIp);

  // Standard X-Forwarded-For (can be comma-separated: client, proxy1, proxy2)
  const xForwardedFor = getHeaderValue(headers, "x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return sanitizeIp(firstIp);
  }

  // X-Real-IP
  const xRealIp = getHeaderValue(headers, "x-real-ip");
  if (xRealIp) return sanitizeIp(xRealIp);

  return "127.0.0.1";
}

function getHeaderValue(
  headers: Headers | Record<string, string | string[] | undefined>,
  headerName: string,
): string | null {
  if (headers instanceof Headers) {
    return headers.get(headerName);
  }

  const value = headers[headerName] ?? headers[headerName.toLowerCase()];
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return typeof value === "string" ? value : null;
}

/**
 * Creates standard HTTP headers for rate limiting.
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };

  if (result.retryAfter !== undefined) {
    headers["Retry-After"] = result.retryAfter.toString();
  }

  return headers;
}

/**
 * Checks rate limit for a specific tier.
 */
export function checkTierRateLimit(
  clientIp: string,
  tier: RateLimitTier,
  customPrefix?: string,
): { allowed: boolean; result: RateLimitResult; headers: Record<string, string> } {
  const prefix = customPrefix ?? tier.toLowerCase();
  const config = RATE_LIMIT_TIERS[tier];
  const result = defaultRateLimiter.check(`${prefix}:${clientIp}`, config);

  return {
    allowed: result.success,
    result,
    headers: getRateLimitHeaders(result),
  };
}
