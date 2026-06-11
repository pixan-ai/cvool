import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { anthropic, MODEL } from "@/lib/anthropic";
import { guard, preflight } from "@/lib/guard";
import { corsHeaders } from "@/lib/cors";

export const maxDuration = 300;

const PROMPT = readFileSync(join(process.cwd(), "src/lib/prompts/analyze.txt"), "utf-8");

function clean(s: string): string {
  return s
    // Strip control characters that would corrupt the prompt or the JSON.
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    // Neutralize the XML delimiters so a CV that literally contains
    // "</cv_text>" can't break out of its wrapper and inject instructions.
    .replace(/<\/?(cv_text|target_role)>/gi, "")
    .trim();
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

export function OPTIONS(req: NextRequest) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  // Size cap + origin allowlist + rate limit, before spending a token.
  const blocked = guard(req, 4_000_000);
  if (blocked) return blocked;

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

  // XML tags help Claude unambiguously distinguish the CV content from the
  // prompt instructions. Recommended by Anthropic for delimiting untrusted input.
  let userMsg = `<cv_text>\n${cv}\n</cv_text>`;
  if (role) userMsg += `\n\n<target_role>${role}</target_role>`;

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
          model: MODEL,
          max_tokens: 8_000,
          temperature: 0,
          system: [{ type: "text", text: PROMPT, cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: userMsg }],
        });

        // Stop generating when the client disconnects — an abandoned tab
        // would otherwise still burn the full multi-thousand-token generation.
        req.signal.addEventListener("abort", () => response.controller.abort(), { once: true });

        for await (const event of response) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            full += event.delta.text;
            tokens++;
            // Stream raw delta so the client can progressively parse and
            // reveal fields (detected_language, score, etc.) as they appear.
            send("chunk", JSON.stringify({ delta: event.delta.text }));
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

        // Parse the accumulated JSON. Strip any leading prose / thinking tags
        // and extract the first balanced JSON object to be defensive against
        // model output variations (markdown fences, leading commentary, etc.).
        let json = full
          .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "")
          .trim();
        const firstBrace = json.indexOf("{");
        const lastBrace = json.lastIndexOf("}");
        if (firstBrace >= 0 && lastBrace > firstBrace) {
          json = json.slice(firstBrace, lastBrace + 1);
        }

        let result;
        try {
          result = JSON.parse(json);
        } catch {
          // Log only the length, never the content — the JSON is derived from
          // the user's CV and could contain PII. (Zero data retention.)
          console.error("Claude returned invalid JSON · chars:", json.length);
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
        if (req.signal.aborted) return; // client left; nobody is listening
        console.error("Claude API error:", e instanceof Error ? e.message : e);
        send("error", JSON.stringify({ error: "api_error" }));
        controller.close();
      }
    },
  });

  return new Response(stream, { headers });
}
