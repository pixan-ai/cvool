# CLAUDE.md

## Project

cvool (cvool.org) — free AI-powered resume improver. Users upload
a PDF or paste CV text. The app analyzes across 6 dimensions, makes
suggestions and generates a professionally rewritten resume.
The score exists but is visually discrete, the hero of the experience
is the improved CV and actionable feedback, not a number.
No sign-up, no data stored, no accounts.
Monetization via voluntary donations.

Name origin: cv + ool (Maya for knowledge/soul/spirit/heart).
Operated by Pixan AI (pixan = soul in Maya).

## Stack

- Next.js 15+ (App Router, Turbopack)
- React 19, Tailwind CSS 4 (OKLCH tokens)
- Claude API (Opus for analysis, Sonnet for PDF parsing)
- Vercel Analytics, deployed on Vercel from main

## Commands

- `npm run dev` — dev server (Turbopack)
- `npm run build` — production build
- `npm run lint` — ESLint

## Architecture

src/
  app/
    page.tsx              <- entire UI (~280 lines)
    layout.tsx            <- meta, fonts, analytics, schema
    globals.css           <- OKLCH tokens, details styling, animations
    api/
      analyze/route.ts    <- Claude analysis (rate limited, 7/hr best-effort)
      parse/route.ts      <- PDF to text (Sonnet)
  lib/
    i18n/
      es.json, en.json, fr.json, pt.json, it.json
      index.ts            <- t() and dimName() helpers
    prompts/
      analyze.txt         <- constitutional prompt (~230 lines)
  types/
    analysis.ts           <- AnalysisResult type

## Design philosophy

Typographic pure — not "Word document minimal" but "iA Writer
meets Stripe" elegant. The UI should feel like a beautifully
typeset document with quiet intelligence underneath.

### What makes it elegant, not plain

1. TYPOGRAPHY WITH INTENTION
   - Dramatic scale contrast: 56px ghost score vs 13px metadata
   - Geist Sans for UI, Geist Mono for data — never mixed
   - font-weight: 300 (light) for large numbers, 500 (medium)
     for headings, 400 for body. Never bold (700).
   - Letter-spacing: tight (-0.02em) on headings, wide (0.05em)
     on uppercase metadata.
   - Line-height: 1.6-1.7 for body text (generous reading rhythm)

2. MICRO-INTERACTIONS (CSS only, no JS)
   - details[open] > summary: smooth color transition
   - Buttons: subtle scale(0.98) on active
   - Focus states: accent ring on all interactive elements
   - Links: color transition on hover, never underline
   - Textarea: border-color transition on focus
   - Copy button: text swap "Copy" -> "Copied" (the only JS interaction)

3. SPACING AS DESIGN
   - Generous vertical rhythm between sections (space-y-6)
   - Score number has extra padding above/below (py-4) — it floats
   - Before/after cards have internal breathing room (p-3)
   - Footer has more top padding than bottom — asymmetric, intentional

4. COLOR DISCIPLINE
   - One accent color (steel blue), used surgically:
     * "ool" in logo
     * Primary action button
     * Improvement suggestions
     * Improved CV section border
     * Focus rings
   - Everything else is ink scale (000-900) — true grayscale
   - Positive (green) only for strengths and "after" examples
   - No color without meaning

5. DETAILS THAT ONLY SHOW WHEN MISSING
   - Consistent border-radius (rounded-lg) on all containers
   - 1px borders (border-ink-100), never 2px
   - Mono font on all numbers and metadata (scores, "sobre 100")
   - Uppercase tracking-wide on labels — signals data, not prose
   - The PDF button sits top-right of textarea, not below it
   - Privacy note in ink-300 (almost invisible, but present)

### Reference aesthetic

Think: iA Writer's focus x Stripe's precision x Anthropic's
restraint. A site where someone says "this feels really well
designed" but can't point to any single decorative element.

## Anti-patterns (never do these)

- Making the score visually prominent (large, bold, colored)
- Using shadows, gradients, or glow effects
- Adding dark mode
- Installing UI libraries (shadcn, Aceternity, Radix, etc.)
- Using font-bold or font-semibold (font-medium max)
- Emoji icons in the UI
- Decorative upload icons or illustrations
- Uniform spacing (same gap everywhere = Word document feel)
- Default border-radius (either 0 or rounded-lg, never rounded)
- Text that all looks the same size (no hierarchy = Word doc)
- Colored backgrounds on sections (keep white, use borders)
- More than one accent color

## Bilingual (5 languages)

- ES, EN, FR, PT, IT
- JSON files in src/lib/i18n/ — one per language
- Claude API detects CV language and responds in the same language
- UI auto-switches lang on detection
- Adding a language: create xx.json, add import to index.ts

## Constitutional prompt

The analyze.txt prompt contains cvool's principles:
- Honesty over comfort (no inflated/deflated scores)
- Zero discrimination (gaps, non-traditional paths)
- Precision not assumptions (evidence-based only)
- Empowerment not fear (never "bad", "poor", "failing")
- ATS knowledge (real parsing rules, keyword matching)
- Recruiter behavior (6-second scan, F-pattern, CAR formula)
- Cultural context (LATAM/Europe vs US/UK norms)
- Target role awareness (tailored feedback when provided)

## Code conventions

- UI: multilingual. Code/comments/commits: English
- CSS animations over JS. No component libraries.
- Single page.tsx contains entire UI
- Analytics via track() from @vercel/analytics
- <details> for all collapsible content — no custom components
- Geist Sans + Geist Mono only — no other fonts

## Operational constraints (do not regress)

### /api/analyze maxDuration must stay at 300s

A real, end-to-end CV analysis with the current setup (Sonnet 4.6,
max_tokens=8000, ~14KB system prompt with ephemeral cache, multi-KB CV
input) realistically takes 60–120 seconds to fully stream the result
JSON. The hard floor is well above 60s.

Both `vercel.json` (`functions["src/app/api/analyze/route.ts"].maxDuration`)
and the route segment export (`export const maxDuration` in
`src/app/api/analyze/route.ts`) must be set to **300**. Do not lower
either of them as a "fix" for slow analysis — lowering it past ~120s
will silently truncate the SSE stream mid-generation: the lambda dies
before the `event: result` line is sent, the client never receives the
final payload, no error event is emitted either, and the UI stays stuck
on the loading state with the user thinking the button does nothing.
This exact regression has happened before and was hard to diagnose
because Vercel returns HTTP 200 (the headers were already flushed)
with a partial body of only progress events.

If you need to reduce the duration, the correct approach is to reduce
the work itself (smaller `max_tokens`, faster model, shorter prompt),
not to clip the timeout.

### /api/analyze SSE parser: currentEvent must persist across chunks

In `src/app/page.tsx` `analyze()`, the `let currentEvent = ""`
declaration MUST live outside the `while (true)` read loop. SSE
`event:` and `data:` lines for the same message can — and for the
~3KB result JSON essentially always do — arrive in different TCP
chunks. If `currentEvent` is reset on every chunk read, the result
event will be silently dropped. Reset `currentEvent` only on an
empty line (the SSE end-of-message marker), not after every `data:`.

### /api/analyze frontend error handling

The client must treat any `!res.ok` response from `/api/analyze` as
an error and call `setError`, not just specific status codes. A 500
or 504 with a non-SSE body otherwise drains silently and the UI
returns to the form with no message — same symptom as above.
