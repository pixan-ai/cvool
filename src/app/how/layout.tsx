import { pageMeta } from "@/lib/metadata";
export const metadata = pageMeta(
  "how",
  ["Cómo funciona", "How it works"],
  ["Pipeline paso a paso, stack técnico, principios de diseño y cómo forkear cvool.", "Step-by-step pipeline, tech stack, design principles, and how to fork cvool."],
  "cvool technical pipeline: 6 steps from resume upload to AI-improved CV. Uses Claude Sonnet 4.6 with temperature 0, input sanitization, constitutional prompt with ethical principles. Stack: Next.js 15, React 19, Tailwind CSS 4, Vercel. No database. MIT licensed.",
);
export { default } from "./page";
