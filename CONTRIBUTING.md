# Contributing to CVool

Thanks for considering a contribution. CVool is solo-maintained, so this guide is short and direct.

## Before opening a PR

**Open an issue first.** A 2-line description of what you want to change saves both of us from wasted work. For typo fixes or one-line bug fixes, skip straight to a PR.

## Local setup

```bash
git clone https://github.com/pixan-ai/cvool.git
cd cvool
npm install
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

The app runs at `http://localhost:3000`. Hot reload works for everything except `src/lib/prompts/analyze.txt` — restart the dev server when you edit the prompt.

## Where help is most useful

- **Translations.** Five languages live in `src/lib/i18n/`. Native speakers spotting awkward copy is high-value, low-effort.
- **The analysis prompt** in `src/lib/prompts/analyze.txt`. This is the actual product. If you're a recruiter, ATS engineer, or career coach and see something that would mislead users, open an issue with concrete examples.
- **Country-specific CV conventions.** LATAM resume norms vary (photo expectations, personal data, header naming). If you're in a country we don't handle well, tell us.
- **Accessibility and mobile.** Real device testing on slow connections always finds something.

## What's out of scope

- **Storing user data.** Privacy is a product promise, not a tradeoff. No databases, no Vercel KV, no cookies beyond what Vercel Analytics needs. Rate limiting is in-memory by design.
- **Account systems, login, paid tiers.** Not on the roadmap.
- **Major framework swaps.** We're on Next.js 15 + React 19 + Tailwind 4. PRs that move us off any of those won't merge.

## House style

- **Surgical changes.** Touch only what you need to. No drive-by reformatting of adjacent code.
- **Match existing style.** TypeScript strict, Tailwind utility classes, no component libraries (no shadcn, no Material, no Chakra).
- **Comments explain *why*, not *what*.** The code shows what it does; comments justify non-obvious decisions.
- **Minimum code that solves the problem.** No abstractions for single-use code.

## Commits and PRs

- One logical change per commit. Small commits review faster.
- Commit messages: imperative mood (`fix: handle empty CV`, not `fixed empty CV bug`). Conventional Commits prefix is appreciated but not enforced.
- PR description: what changed, why, how to verify. A screenshot or 5-second recording for UI changes is gold.

## What you'll get

A real review. Probably opinionated. Hopefully useful. CVool exists because someone in Bogotá or São Paulo or Mexico City needed help getting an interview — keep them in mind when you write the diff and we'll get along fine.

## Contact

- Issues: [github.com/pixan-ai/cvool/issues](https://github.com/pixan-ai/cvool/issues)
- Email: alfredo@cvool.org
- Security: security@cvool.org (please don't open public issues for security)
