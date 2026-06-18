/**
 * Visit notifier — pings the operator on WhatsApp (via CallMeBot) when a new
 * visitor session lands on cvool.org. Best-effort and zero data stored: it
 * sends an ephemeral message and persists nothing.
 *
 * Anti-flood is layered, so neither real traffic spikes nor someone hammering
 * the public endpoint can drown the operator's phone:
 *   1. Client dedupes per browser session (sessionStorage) — see page.tsx.
 *   2. Global cooldown here collapses bursts and respects CallMeBot's own
 *      rate limits (it throttles/blocks senders that fire too fast).
 *   3. Per-IP hourly cap stops a single source from spamming the endpoint.
 * All limiters are in-memory / per-instance (same trade-off as rate-limit.ts):
 * a cold start resets them. They cap abuse, they don't guarantee exact counts.
 *
 * Env vars:
 *   CALLMEBOT_PHONE            — destination number, intl format e.g. +52155...
 *   CALLMEBOT_APIKEY           — key CallMeBot issues for that number
 *   VISIT_NOTIFY_COOLDOWN_MS   — min gap between any two sends (default 4000)
 *   VISIT_NOTIFY_PER_IP_HOUR   — max notifications per IP per hour (default 4)
 *
 * When phone/apikey are unset the module is a silent no-op, so the endpoint
 * stays safe to deploy before the operator has finished CallMeBot setup.
 */

const COOLDOWN_MS = parseInt(process.env.VISIT_NOTIFY_COOLDOWN_MS || "4000", 10);
const PER_IP_MAX = parseInt(process.env.VISIT_NOTIFY_PER_IP_HOUR || "4", 10);
const HOUR_MS = 3_600_000;

let lastSentAt = 0;
const perIp = new Map<string, { count: number; resetAt: number }>();

/**
 * Best-effort gate. Returns true (and records the send) only when both the
 * global cooldown has elapsed AND this IP is under its hourly cap. The
 * cooldown is checked first so an abuser can't even consume per-IP slots
 * faster than the cooldown allows.
 */
export function shouldNotify(ip: string): boolean {
  const now = Date.now();
  if (now - lastSentAt < COOLDOWN_MS) return false;

  // Opportunistic sweep so the map can't grow unbounded across a warm instance.
  if (perIp.size > 1000) for (const [k, v] of perIp) if (now > v.resetAt) perIp.delete(k);

  const r = perIp.get(ip);
  if (!r || now > r.resetAt) {
    perIp.set(ip, { count: 1, resetAt: now + HOUR_MS });
  } else if (r.count >= PER_IP_MAX) {
    return false;
  } else {
    r.count++;
  }

  lastSentAt = now;
  return true;
}

/**
 * Fire the WhatsApp message. Never throws — a notification failure must never
 * affect the visitor's request. No-ops silently when CallMeBot isn't
 * configured yet.
 */
export async function sendWhatsApp(text: string): Promise<void> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apikey = process.env.CALLMEBOT_APIKEY;
  if (!phone || !apikey) return; // not configured — silent no-op

  const url =
    `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;

  try {
    // 8s budget — CallMeBot can be slow; don't hold the lambda open for long.
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8_000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) console.warn("callmebot non-ok status:", res.status);
  } catch (e) {
    console.warn("callmebot send failed:", e instanceof Error ? e.message : e);
  }
}
