import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { validateOrigin, corsHeaders } from "@/lib/cors";
import { isRateLimited, getClientIp } from "@/lib/rate-limit";

const anthropic = new Anthropic();

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

  // Rate limit (shares the same window as /api/analyze)
  if (isRateLimited(getClientIp(req.headers))) {
    return NextResponse.json({ error: "rate_limit" }, { status: 429, headers: corsHeaders(req) });
  }

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
  const base64 = buffer.toString("base64");

  try {
    const msg = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-4-6",
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
