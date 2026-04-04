import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";

const PROMPT = readFileSync(join(process.cwd(), "src/lib/prompts/analyze.txt"), "utf-8");
const anthropic = new Anthropic();

// NOTE: in-memory rate limiting is best-effort on Vercel serverless.
// Each cold start gets a fresh Map. For strict enforcement, use Vercel KV or Upstash Redis.
const limits = new Map<string, { count: number; resetAt: number }>();

function ip(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

function limited(key: string): boolean {
  const now = Date.now();
  const r = limits.get(key);
  if (!r || now > r.resetAt) {
    limits.set(key, { count: 1, resetAt: now + 3_600_000 });
    return false;
  }
  if (r.count >= 7) return true;
  r.count++;
  return false;
}

function clean(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
}

export async function POST(req: NextRequest) {
  if (limited(ip(req))) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429 });
  }

  let body: { cvText?: string; targetRole?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const cv = clean(body.cvText ?? "").slice(0, 35_000);
  if (cv.length < 50) {
    return NextResponse.json({ error: "too_short" }, { status: 400 });
  }

  const role = clean((body.targetRole ?? "").slice(0, 200));
  let userMsg = `Here is the resume to analyze:\n\n${cv}`;
  if (role) userMsg += `\n\nTarget role: ${role}`;

  try {
    const msg = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-opus-4-6",
      max_tokens: 16_000,
      temperature: 0,
      system: [{ type: "text", text: PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: userMsg }],
    });

    const raw = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    const json = raw.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();

    const result = JSON.parse(json);
    if (!result.score || !result.analysis || !result.improved_cv) {
      return NextResponse.json({ error: "incomplete" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (e: unknown) {
    console.error("Claude API error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "api_error" }, { status: 500 });
  }
}
