import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";
import { validateOrigin, corsHeaders } from "@/lib/cors";

export const maxDuration = 60;

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

        if (!result.score || !result.analysis || !result.improved_cv) {
          console.error("Claude returned incomplete result");
          send("error", JSON.stringify({ error: "incomplete" }));
          controller.close();
          return;
        }

        send("result", JSON.stringify(result));
        controller.close();
      } catch (e: unknown) {
        console.error("Claude API error:", e instanceof Error ? e.message : e);
        const send = (event: string, data: string) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));
        };
        send("error", JSON.stringify({ error: "api_error" }));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
