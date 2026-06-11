/**
 * In-memory rate limiter — zero data stored.
 *
 * Best-effort on Vercel serverless (resets on cold start).
 * For stricter enforcement, add Cloudflare or Vercel WAF rate
 * limiting at the edge layer — outside of application code.
 *
 * Env vars:
 *   RATE_LIMIT_TIMES_IN_HOUR   — max requests per hour per IP (default: 7)
 *   RATE_LIMIT_GLOBAL_PER_HOUR — circuit breaker: max requests per hour per
 *                                instance, all IPs combined (default: 300)
 */

const MAX = parseInt(process.env.RATE_LIMIT_TIMES_IN_HOUR || "7", 10);
// Defense-in-depth ceiling on total Claude calls for this instance. The per-IP
// limit is the primary gate; this caps a single instance's spend if the per-IP
// limiter is ever evaded. Best-effort (in-memory, per-instance) like the IP
// limiter — set high enough that legitimate traffic never trips it.
const GLOBAL_MAX = parseInt(process.env.RATE_LIMIT_GLOBAL_PER_HOUR || "300", 10);
const WINDOW_MS = 3_600_000; // 1 hour, always

const store = new Map<string, { count: number; resetAt: number }>();
let globalCount = 0;
let globalResetAt = 0;

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  // Global circuit breaker — only allowed requests count toward it.
  if (now > globalResetAt) { globalCount = 0; globalResetAt = now + WINDOW_MS; }
  if (globalCount >= GLOBAL_MAX) return true;
  // Opportunistic sweep of expired entries — a module-level setInterval
  // would keep the serverless event loop alive between invocations.
  if (store.size > 1000) for (const [k, v] of store) if (now > v.resetAt) store.delete(k);
  const r = store.get(key);
  if (!r || now > r.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    globalCount++;
    return false;
  }
  if (r.count >= MAX) return true;
  r.count++;
  globalCount++;
  return false;
}

export function getClientIp(headers: Headers): string {
  // Prefer x-real-ip: on Vercel the edge sets it to the true peer IP and the
  // client cannot forge it. The LEFT-most x-forwarded-for entry is client-
  // supplied (a proxy appends, it doesn't replace), so trusting it would let an
  // attacker rotate the value per request and defeat the limiter. If we must
  // fall back to x-forwarded-for, use the LAST hop (added by the trusted proxy).
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const last = headers.get("x-forwarded-for")?.split(",").pop()?.trim();
  return last || "unknown";
}
