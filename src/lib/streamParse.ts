// Incremental parser for Anthropic's streamed JSON output, via partial-json.
// Given the accumulated raw text from the stream, returns whatever subset of
// the result JSON has streamed so far. Strings reveal progressively
// (typewriter effect); numbers are withheld until complete (~Allow.NUM) so a
// score never flashes 5 before becoming 54. The model may open with a
// markdown fence or prose, hence the first-brace slice.

import { Allow, parse } from "partial-json";
import type { PartialResult } from "@/types/analysis";

export function parsePartial(buf: string): PartialResult {
  const start = buf.indexOf("{");
  if (start < 0) return {};
  try {
    return parse(buf.slice(start), Allow.ALL & ~Allow.NUM) as PartialResult;
  } catch {
    return {};
  }
}
