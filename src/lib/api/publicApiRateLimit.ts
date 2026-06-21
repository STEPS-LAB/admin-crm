import type { RateLimitResult } from "@/lib/security/rateLimiter";

export interface PublicApiRateLimitMeta {
  readonly limit: number;
  readonly remaining: number;
  readonly resetAt: number;
}

export function buildPublicApiRateLimitHeaders(
  meta: PublicApiRateLimitMeta,
): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(meta.limit),
    "X-RateLimit-Remaining": String(meta.remaining),
    "X-RateLimit-Reset": String(Math.ceil(meta.resetAt / 1_000)),
  };
}

export function toPublicApiRateLimitMeta(
  limit: number,
  result: RateLimitResult,
): PublicApiRateLimitMeta {
  return {
    limit,
    remaining: result.remaining,
    resetAt: result.resetAt,
  };
}
