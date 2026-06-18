import { NextRequest, NextResponse } from "next/server";
import { validateOrigin, corsHeaders } from "@/lib/cors";
import { getClientIp } from "@/lib/rate-limit";
import { preflight } from "@/lib/guard";
import { shouldNotify, sendWhatsApp } from "@/lib/visit-notify";
import { LANGS } from "@/lib/i18n";

// In-memory throttle in visit-notify.ts only survives on a warm Node lambda —
// keep this off the edge runtime so the cooldown actually holds.
export const runtime = "nodejs";

// The ping is JS-triggered (fired on mount from page.tsx), so crawlers that
// don't render JS never reach here at all. This catches the renderers and
// scripted clients that do — link unfurlers, headless browsers, HTTP libs —
// so they don't masquerade as real human visits.
const BOT_RE =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|vkshare|preview|scan|monitor|lighthouse|headless|python-requests|axios|node-fetch|okhttp|curl|wget|go-http/i;

// Keep operator-bound strings short and free of control chars (the referrer is
// attacker-controllable) before they land in the WhatsApp message.
function sanitize(s: string, max: number): string {
  return s.replace(/[\x00-\x1F\x7F]/g, " ").trim().slice(0, max);
}

export function OPTIONS(req: NextRequest) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  const originError = validateOrigin(req);
  if (originError) return originError;

  const ok = (skipped?: string) =>
    NextResponse.json({ ok: true, ...(skipped ? { skipped } : {}) }, { headers: corsHeaders(req) });

  const ua = req.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) return ok("bot");

  // Throttle BEFORE building the message or hitting CallMeBot — the gate is
  // the primary defense against flooding the operator's phone.
  if (!shouldNotify(getClientIp(req.headers))) return ok("throttled");

  const url = new URL(req.url);
  const langParam = (url.searchParams.get("lang") || "").toLowerCase();
  const lang = (LANGS as readonly string[]).includes(langParam) ? langParam.toUpperCase() : "?";

  // Geo comes from Vercel's edge headers when present (operator-only, not
  // stored). x-vercel-ip-city is URL-encoded by the platform.
  const country = sanitize(req.headers.get("x-vercel-ip-country") || "", 4);
  let city = "";
  try { city = sanitize(decodeURIComponent(req.headers.get("x-vercel-ip-city") || ""), 40); } catch { /* malformed */ }
  const place = [city, country].filter(Boolean).join(", ");

  // External referrer is read client-side (document.referrer) and passed as a
  // param — the request's own `referer` header is same-origin and useless here.
  const ref = sanitize(url.searchParams.get("ref") || "", 120);

  const time = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit", minute: "2-digit", timeZone: "America/Mexico_City",
  }).format(new Date());

  const lines = [
    "🔔 cvool.org — nueva visita",
    `Idioma: ${lang}${place ? ` · ${place}` : ""}`,
  ];
  if (ref) lines.push(`Desde: ${ref}`);
  lines.push(`${time} CDMX`);

  // Await (not fire-and-forget): on serverless the lambda can freeze the moment
  // the response returns, killing an un-awaited fetch. sendWhatsApp caps its own
  // duration, so the visitor's background ping never hangs.
  await sendWhatsApp(lines.join("\n"));

  return ok();
}
