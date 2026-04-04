import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { validateOrigin, corsHeaders } from "@/lib/cors";

const PROMPT = readFileSync(join(process.cwd(), "src/lib/prompts/analyze.txt"), "utf-8");
const anthropic = new Anthropic();

function clean(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  // CORS check
  const originError = validateOrigin(req);
  if (originError) return originError;

  // Rate limit
  if (isRateLimited(getClientIp(req.headers))) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429, headers: corsHeaders(req) });
  }

  let body: { cvText?: string; targetRole?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400, headers: corsHeaders(req) });
  }

  const cv = clean(body.cvText ?? "").slice(0, 35_000);
  if (cv.length < 50) {
    return NextResponse.json({ error: "too_short" }, { status: 400, headers: corsHeaders(req) });
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

    let result;
    try {
      result = JSON.parse(json);
    } catch {
      console.error("Claude returned invalid JSON:", json.slice(0, 500));
      return NextResponse.json({ error: "parse_error" }, { status: 500, headers: corsHeaders(req) });
    }

    if (!result.score || !result.analysis || !result.improved_cv) {
      console.error("Claude returned incomplete result — missing required fields");
      return NextResponse.json({ error: "incomplete" }, { status: 500, headers: corsHeaders(req) });
    }

    return NextResponse.json(result, { headers: corsHeaders(req) });
  } catch (e: unknown) {
    console.error("Claude API error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "api_error" }, { status: 500, headers: corsHeaders(req) });
  }
}
