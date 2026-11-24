// Acceptance checks for the model cvool runs on. They read the source, so they
// run without a network or an API key: `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const routes = ["src/app/api/analyze/route.ts", "src/app/api/parse/route.ts"];
const LANGS = ["es", "en", "fr", "pt", "it"];

test("cvool runs on Claude Sonnet 5.5 unless CLAUDE_MODEL says otherwise", () => {
  assert.match(read("src/lib/anthropic.ts"), /process\.env\.CLAUDE_MODEL \|\| "claude-sonnet-5-5"/);
});

// Sonnet 5.5 rejects thinking: disabled with a 400; between_tools is how it
// runs without thinking. Both routes need it, or every request fails.
for (const route of routes) {
  test(`${route} turns thinking off the way Sonnet 5.5 accepts`, () => {
    const source = read(route);
    assert.match(source, /thinking: \{ type: "between_tools" \}/);
    assert.doesNotMatch(source, /type: "disabled"/);
  });

  test(`${route} sends no sampling parameters (Sonnet 5.5 rejects them)`, () => {
    assert.doesNotMatch(read(route), /\b(temperature|top_p|top_k):/);
  });
}

// A Sonnet 5.5 response can start with a thinking block, so the text is found
// by its type, not by position.
test("the PDF route takes the text block by type", () => {
  assert.match(read("src/app/api/parse/route.ts"), /content\.find\(\(block\) => block\.type === "text"\)/);
});

test("the home page names the model in all five languages", () => {
  const home = JSON.parse(read("src/content/home.json"));
  for (const lang of LANGS) assert.match(home[lang].analyzeFooter, /Claude Sonnet 5\.5/, lang);
});

test("no page, guide or doc still names Sonnet 5 as the model", () => {
  const files = [
    "src/content/home.json", "src/content/how.json", "src/content/donate.json",
    "src/app/how/layout.tsx", "src/app/donate/layout.tsx", "src/components/TechMap.tsx",
    "public/llms.txt", "public/llms-full.txt", "README.md",
  ];
  for (const file of files) {
    assert.doesNotMatch(read(file), /Sonnet 5(?!\.5)/, file);
    assert.doesNotMatch(read(file), /claude-sonnet-5(?!-5)/, file);
  }
});
