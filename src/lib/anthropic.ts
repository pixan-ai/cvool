import Anthropic from "@anthropic-ai/sdk";

// Single shared Anthropic client + model default. Centralized so a client-config
// or model change happens in exactly one place — both API routes (analyze, parse)
// import from here instead of each constructing their own client and re-reading
// the env var. The model decision is documented in CLAUDE.md (Sonnet 4.6 is a
// closed decision; latency is output-bound, so don't swap it as a perf fix).
export const anthropic = new Anthropic();
export const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-4-6";
