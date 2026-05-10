# CVool

**Free, open-source AI CV optimizer — primarily for Spanish & Portuguese speakers, with 5 languages available**

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org)
[![Powered by Claude](https://img.shields.io/badge/Powered%20by-Claude-orange.svg)](https://anthropic.com)

[cvool.org](https://cvool.org)

---

## What is CVool?

CVool analyzes and improves your resume using AI. Paste your CV text or upload a PDF, and get:

- A **score (0–100)** across 6 dimensions (ATS compatibility, achievement impact, structure, keywords, writing clarity, completeness)
- **Actionable feedback** with before/after examples
- A **professionally rewritten CV** ready to copy

No sign-up. No data stored. No tracking. Free forever.

## Features

- **5 languages**: Spanish, English, French, Portuguese, Italian — auto-detected
- **PDF support**: Upload a PDF and Claude reads it natively
- **Zero data retention**: Your resume is processed in memory and discarded immediately
- **Constitutional AI prompt**: Ethical principles baked into the analysis — no discrimination, no hallucination, no inflated scores
- **Open source**: The code, the AI prompt, and the scoring weights are all public
- **Public verifiable counters**: visit and CVs-analyzed counters live on [abacus.jasoncameron.dev](https://abacus.jasoncameron.dev/get/cvool/visits) (no database, fully auditable)

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 + React 19 + Tailwind CSS 4 |
| Typography | Geist + Geist Mono |
| AI | Claude Sonnet 4.6 (Anthropic SDK) |
| Deploy | Vercel (auto-deploy on push) |
| Analytics | Vercel Analytics (anonymous, aggregate) |
| Database | None |

## Getting started

```bash
git clone https://github.com/pixan-ai/cvool.git
cd cvool
npm install
cp .env.example .env.local
# Edit .env.local with your Anthropic API key
npm run dev
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |
| `CLAUDE_MODEL` | No | Model to use (default: `claude-sonnet-4-6`) |

## Architecture

```
src/
  app/
    page.tsx              # Main UI (single file by design)
    layout.tsx            # Metadata, fonts, analytics, JSON-LD
    globals.css           # OKLCH tokens, animations
    about/                # /about (founder, mission)
    how/                  # /how (pipeline, stack, fork)
    donate/               # /donate (BMC, promise)
    legal/                # /legal (security, privacy, terms)
    api/
      analyze/route.ts    # Claude analysis (rate limited, SSE)
      parse/route.ts      # PDF to text (Sonnet)
  components/             # Brand, icons, counters, step badge, sub-layout
  content/
    home.json             # Home UI strings (es, en, fr, pt, it)
    about.json, how.json, donate.json, legal.json   # Sub-page copy (es, en)
  lib/
    i18n.ts               # t() and dimName() helpers, Lang type
    cors.ts               # Origin allowlist + CORS headers
    rate-limit.ts         # In-memory limiter (7 req/hr per IP)
    streamParse.ts        # Incremental JSON parser for SSE chunks
    metadata.ts           # pageMeta() helper for sub-routes
    prompts/
      analyze.txt         # Constitutional AI prompt
  types/
    analysis.ts           # AnalysisResult, PartialResult types
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for how to set up the project locally, areas where help is most useful, and the small rules that keep the codebase calm.

## License

[MIT](LICENSE) — fork it, modify it, launch your own.

## Contact

- General: alfredo@cvool.org
- Security: security@cvool.org
- GitHub: [pixan-ai/cvool](https://github.com/pixan-ai/cvool)
- X: [@cvoolorg](https://x.com/cvoolorg)
- Donate: [buymeacoffee.com/cvool](https://buymeacoffee.com/cvool)
