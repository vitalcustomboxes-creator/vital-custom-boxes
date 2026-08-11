/**
 * lib/rate-limit.ts — naive in-memory sliding-window rate limiter (BE-3 owned).
 *
 * SERVERLESS CAVEAT (documented for SECURITY wave): the Map lives in module
 * scope, so the limit is per server instance — on Vercel/serverless each warm
 * lambda keeps its own window and cold starts reset it. That makes this a
 * tripwire against casual form spam, NOT a hard guarantee. For real abuse
 * protection swap in a shared store (Upstash Redis / Vercel KV) behind the
 * same `rateLimit()` signature at deploy time.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
/** Soft cap on tracked keys so a spoofed-IP flood can't grow memory unbounded. */
const MAX_KEYS = 5_000;

const hits = new Map<string, number[]>();

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
}

/**
 * Returns `true` when the call is allowed, `false` when `key` has exceeded
 * `limit` calls within `windowMs` (default 5/min).
 */
export function rateLimit(key: string, options: RateLimitOptions = {}): boolean {
  const limit = options.limit ?? MAX_PER_WINDOW;
  const windowMs = options.windowMs ?? WINDOW_MS;
  const now = Date.now();

  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }

  recent.push(now);

  // Opportunistic pruning: drop stale keys before the map can grow unbounded.
  if (!hits.has(key) && hits.size >= MAX_KEYS) {
    for (const [k, stamps] of hits) {
      if (stamps.every((t) => now - t >= windowMs)) hits.delete(k);
      if (hits.size < MAX_KEYS) break;
    }
  }

  hits.set(key, recent);
  return true;
}

/** Test hook — clears all windows (used by tests/actions.test.ts). */
export function resetRateLimit(): void {
  hits.clear();
}
