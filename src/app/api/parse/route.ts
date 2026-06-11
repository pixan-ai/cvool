import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL } from "@/lib/anthropic";
import { guard, preflight } from "@/lib/guard";
import { corsHeaders } from "@/lib/cors";

export const maxDuration = 300;

export function OPTIONS(req: NextRequest) {
  return preflight(req);
}

export async function POST(req: NextRequest) {
  // Size cap (7MB = 5MB PDF + multipart/base64 overhead) + origin + rate limit.
  // Shares the rate-limit window with /api/analyze, so PDF parsing can't be
  // used to bypass the per-IP budget.
  const blocked = guard(req, 7_000_000);
  if (blocked) return blocked;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form" }, { status: 400, headers: corsHeaders(req) });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File) || file.type !== "application/pdf") {
    return NextResponse.json({ error: "invalid_file" }, { status: 400, headers: corsHeaders(req) });
  }

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "too_large" }, { status: 400, headers: corsHeaders(req) });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // file.type is the client-declared MIME and is spoofable; verify the real
  // PDF magic bytes before handing the file to Claude.
  if (!buffer.subarray(0, 5).toString("latin1").startsWith("%PDF")) {
    return NextResponse.json({ error: "invalid_file" }, { status: 400, headers: corsHeaders(req) });
  }

  const base64 = buffer.toString("base64");

  try {
    const msg = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 8_000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: "application/pdf", data: base64 },
            },
            {
              type: "text",
              text: "Extract all text from this resume/CV. Return ONLY the raw text content, preserving the original structure, sections, and line breaks. No commentary.",
            },
          ],
        },
      ],
    });

    const text = msg.content[0]?.type === "text" ? msg.content[0].text : "";
    return NextResponse.json({ text }, { headers: corsHeaders(req) });
  } catch (e: unknown) {
    console.error("PDF parse error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "parse_failed" }, { status: 500, headers: corsHeaders(req) });
  }
}
