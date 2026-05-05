import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { validateOrigin, corsHeaders } from "@/lib/cors";

export const maxDuration = 300;

const PROMPT = readFileSync(join(process.cwd(), "src/lib/prompts/analyze.txt"), "utf-8");
const anthropic = new Anthropic();

function clean(s: string): string {
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
}

// Validate the shape of the AnalysisResult JSON Claude produces.
// Per-field check (not just truthy presence) so we catch silent drift —
// e.g. wrong type, missing nested array, summary-as-number — at the
// backend boundary instead of letting each UI defend itself differently.
// score.total === 0 is a legitimate value (not falsy-rejected here).
function isValidResult(r: unknown): boolean {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  const score = x.score as Record<string, unknown> | undefined;
  const analysis = x.analysis as Record<string, unknown> | undefined;
  const improved = x.improved_cv as Record<string, unknown> | undefined;
  return (
    !!score &&
    typeof score.total === "number" &&
    typeof score.summary === "string" &&
    !!analysis &&
    Array.isArray(analysis.strengths) &&
    Array.isArray(analysis.improvements) &&
    !!improved &&
    typeof improved.text === "string" &&
    Array.isArray(improved.changes)
  );
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  // Reject oversized payloads before reading the body into memory.
  const contentLength = req.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 4_000_000) {
    return new Response(JSON.stringify({ error: "payload_too_large" }), { status: 413 });
  }

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

  const headers = {
    ...corsHeaders(req),
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: string) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
      };

      try {
        let full = "";
        let tokens = 0;

        const response = await anthropic.messages.stream({
          model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
          max_tokens: 8_000,
          temperature: 0,
          system: [{ type: "text", text: PROMPT, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userMsg }],
        });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            tokens++;
            // Send progress every 10 tokens for smoother bar
            if (tokens % 10 === 0) {
              send("progress", JSON.stringify({ tokens }));
            }
          }
        }

        // Final progress
        send("progress", JSON.stringify({ tokens, done: true }));

        // Cache diagnostics — measure prompt-cache hit rate from production
        // traffic. Filter Vercel runtime logs by `cache-stats` to inspect.
        // No PII logged (only token counts and CV character length).
        try {
          const finalMsg = await response.finalMessage();
          const u = finalMsg.usage;
          console.log("cache-stats", JSON.stringify({
            cache_creation: u.cache_creation_input_tokens ?? 0,
            cache_read: u.cache_read_input_tokens ?? 0,
            input: u.input_tokens ?? 0,
            output: u.output_tokens ?? 0,
            cv_chars: cv.length,
          }));
        } catch (e) {
          console.warn("cache-stats failed:", e instanceof Error ? e.message : e);
        }

        // Parse the accumulated JSON
        const json = full
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "")
          .trim();

        let result;
        try {
          result = JSON.parse(json);
        } catch {
          console.error("Claude returned invalid JSON:", json.slice(0, 500));
          send("error", JSON.stringify({ error: "parse_error" }));
          controller.close();
          return;
        }

        if (!isValidResult(result)) {
          console.error("Claude returned malformed result shape");
          send("error", JSON.stringify({ error: "incomplete" }));
          controller.close();
          return;
        }

        send("result", JSON.stringify(result));
        controller.close();
      } catch (e: unknown) {
        console.error("Claude API error:", e instanceof Error ? e.message : e);
        send("error", JSON.stringify({ error: "api_error" }));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
