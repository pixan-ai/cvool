// Incremental parser for Anthropic's streamed JSON output.
// Pure functions — no React, no SDK. Given the accumulated raw text from the
// stream, returns a PartialResult containing whichever top-level fields have
// been parsed so far. Designed for the cvool /api/analyze schema, which has
// globally-unique keys (detected_language, inferred_role, total, summary,
// strengths, improvements, text, changes), so a flat key search is safe.
//
// Conservative on flicker: numbers only return when followed by a terminator,
// array items only return when their object/string closes. Strings return
// whatever has streamed (typewriter reveal).
//
// Uses charAt() rather than indexed access because tsconfig has
// noUncheckedIndexedAccess: true.

import type { Improvement, PartialResult, Strength } from "@/types/analysis";

const WS = /\s/;
const NUM = /[-0-9.eE+]/;

// Read a JSON string literal starting at position `start` (must be `"`).
// Decodes standard escape sequences. Returns the decoded value plus the index
// right after the closing quote. If the closing quote hasn't streamed yet,
// endAfter is -1 and value contains everything decoded so far.
function readString(buf: string, start: number): { value: string; endAfter: number } | null {
  if (buf.charAt(start) !== '"') return null;
  let i = start + 1;
  let val = "";
  while (i < buf.length) {
    const c = buf.charAt(i);
    if (c === "\\") {
      if (i + 1 >= buf.length) return { value: val, endAfter: -1 };
      const n = buf.charAt(i + 1);
      if (n === "n") { val += "\n"; i += 2; continue; }
      if (n === "t") { val += "\t"; i += 2; continue; }
      if (n === "r") { val += "\r"; i += 2; continue; }
      if (n === '"') { val += '"'; i += 2; continue; }
      if (n === "\\") { val += "\\"; i += 2; continue; }
      if (n === "/") { val += "/"; i += 2; continue; }
      if (n === "b") { val += "\b"; i += 2; continue; }
      if (n === "f") { val += "\f"; i += 2; continue; }
      if (n === "u") {
        if (i + 5 >= buf.length) return { value: val, endAfter: -1 };
        val += String.fromCharCode(parseInt(buf.slice(i + 2, i + 6), 16));
        i += 6;
        continue;
      }
      val += n; i += 2; continue;
    }
    if (c === '"') return { value: val, endAfter: i + 1 };
    val += c;
    i++;
  }
  return { value: val, endAfter: -1 };
}

// Index of the first non-whitespace char after `"key":`. Returns -1 if not found.
function findKeyValueStart(buf: string, key: string): number {
  const idx = buf.indexOf(`"${key}":`);
  if (idx < 0) return -1;
  let i = idx + key.length + 3;
  while (i < buf.length && WS.test(buf.charAt(i))) i++;
  return i;
}

function getString(buf: string, key: string): string | null {
  const i = findKeyValueStart(buf, key);
  if (i < 0) return null;
  const r = readString(buf, i);
  return r ? r.value : null;
}

// Returns a number only when followed by a terminator (so we never reveal a
// half-grown digit sequence that could change value, e.g. 5 -> 54).
function getNumber(buf: string, key: string): number | null {
  let i = findKeyValueStart(buf, key);
  if (i < 0) return null;
  const start = i;
  while (i < buf.length && NUM.test(buf.charAt(i))) i++;
  if (i === start) return null;
  if (i >= buf.length) return null;
  const num = parseFloat(buf.slice(start, i));
  return Number.isFinite(num) ? num : null;
}

// Walk the buffer from `start` (must point at `{` or `[`) until the matching
// close, respecting JSON string escaping. Returns the index right after the
// close, or -1 if not yet streamed.
function findMatchingClose(buf: string, start: number): number {
  const open = buf.charAt(start);
  if (open !== "{" && open !== "[") return -1;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let i = start;
  while (i < buf.length) {
    const c = buf.charAt(i);
    if (inStr) {
      if (c === "\\") { i += 2; continue; }
      if (c === '"') inStr = false;
      i++;
      continue;
    }
    if (c === '"') { inStr = true; i++; continue; }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return i + 1;
    }
    i++;
  }
  return -1;
}

// Parse complete items from an array keyed by `key`. Items can be objects or
// strings. Items still being streamed are not included. Returns the items
// parsed so far (possibly empty array if key is found but no item complete);
// returns null if the key isn't in the buffer yet.
function getArray<T>(buf: string, key: string): T[] | null {
  let i = findKeyValueStart(buf, key);
  if (i < 0) return null;
  if (buf.charAt(i) !== "[") return null;
  i++;

  const items: T[] = [];
  while (i < buf.length) {
    while (i < buf.length && (WS.test(buf.charAt(i)) || buf.charAt(i) === ",")) i++;
    if (i >= buf.length) break;
    const c = buf.charAt(i);
    if (c === "]") return items;

    if (c === '"') {
      const r = readString(buf, i);
      if (!r || r.endAfter < 0) break;
      items.push(r.value as unknown as T);
      i = r.endAfter;
      continue;
    }
    if (c === "{" || c === "[") {
      const end = findMatchingClose(buf, i);
      if (end < 0) break;
      try {
        items.push(JSON.parse(buf.slice(i, end)));
      } catch {
        // Completed object that's still malformed — bail; the final
        // event:result will overwrite anyway.
        break;
      }
      i = end;
      continue;
    }
    break;
  }
  return items;
}

export function parsePartial(buf: string): PartialResult {
  const out: PartialResult = {};

  const lang = getString(buf, "detected_language");
  if (lang) out.detected_language = lang;

  const role = getString(buf, "inferred_role");
  if (role) out.inferred_role = role;

  const total = getNumber(buf, "total");
  const summary = getString(buf, "summary");
  if (total != null || summary != null) {
    out.score = {};
    if (total != null) out.score.total = total;
    if (summary != null) out.score.summary = summary;
  }

  const strengths = getArray<Strength>(buf, "strengths");
  const improvements = getArray<Improvement>(buf, "improvements");
  if (strengths !== null || improvements !== null) {
    out.analysis = {};
    if (strengths !== null) out.analysis.strengths = strengths;
    if (improvements !== null) out.analysis.improvements = improvements;
  }

  const text = getString(buf, "text");
  const changes = getArray<string>(buf, "changes");
  if (text != null || changes !== null) {
    out.improved_cv = {};
    if (text != null) out.improved_cv.text = text;
    if (changes !== null) out.improved_cv.changes = changes;
  }

  return out;
}
