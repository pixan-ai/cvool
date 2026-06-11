import { NextRequest, NextResponse } from "next/server";
import { validateOrigin, corsHeaders } from "@/lib/cors";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

// Single front door for both API routes. Runs the cheap defenses in order —
// payload-size cap (before the body is read into memory), origin allowlist,
// then rate limit — and returns a response to short-circuit, or null to let
// the request proceed. Centralizing it means the two endpoints' security
// checks can never silently drift apart, and a new defense is added once.
export function guard(req: NextRequest, maxBytes: number): NextResponse | null {
  if (parseInt(req.headers.get("content-length") ?? "0") > maxBytes) {
    return NextResponse.json({ error: "too_large" }, { status: 413, headers: corsHeaders(req) });
  }
  const originError = validateOrigin(req);
  if (originError) return originError;
  if (isRateLimited(getClientIp(req.headers))) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429, headers: corsHeaders(req) });
  }
  return null;
}

// Both routes answer the CORS preflight identically.
export function preflight(req: NextRequest): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}
