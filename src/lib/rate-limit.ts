/**
 * In-memory rate limiter — zero data stored.
 *
 * Best-effort on Vercel serverless (resets on cold start).
 * For stricter enforcement, add Cloudflare or Vercel WAF rate
 * limiting at the edge layer — outside of application code.
 *
 * Env vars:
 *   RATE_LIMIT_TIMES_IN_HOUR — max requests per hour (default: 7)
 */

const MAX = parseInt(process.env.RATE_LIMIT_TIMES_IN_HOUR || "7", 10);
const WINDOW_MS = 3_600_000; // 1 hour, always

const store = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  // Opportunistic sweep of expired entries — a module-level setInterval
  // would keep the serverless event loop alive between invocations.
  if (store.size > 1000) for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  const r = store.get(key);
  if (!r || now > r.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (r.count >= MAX) return true;
  r.count++;
  return false;
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
