interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAt: number;
}

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    return {
      allowed: true,
      remaining: maxAttempts,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAt: entry.resetAt,
  };
}

export function recordFailedAttempt(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt,
    };
  }

  const nextCount = entry.count + 1;
  store.set(key, { count: nextCount, resetAt: entry.resetAt });

  return {
    allowed: nextCount < maxAttempts,
    remaining: Math.max(0, maxAttempts - nextCount),
    resetAt: entry.resetAt,
  };
}

export function clearRateLimit(key: string): void {
  store.delete(key);
}

export function consumeRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetAt,
    };
  }

  if (entry.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  const nextCount = entry.count + 1;
  store.set(key, { count: nextCount, resetAt: entry.resetAt });

  return {
    allowed: true,
    remaining: maxAttempts - nextCount,
    resetAt: entry.resetAt,
  };
}

export function resetRateLimitStore(): void {
  store.clear();
}
