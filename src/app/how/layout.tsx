import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
export const metadata: Metadata = pageMetadata(
  "how",
  "C\u00f3mo funciona",
  "How it works",
  "Pipeline paso a paso, stack t\u00e9cnico, principios de dise\u00f1o y c\u00f3mo forkear cvool.",
  "Step-by-step pipeline, tech stack, design principles, and how to fork cvool.",
  "cvool technical pipeline: 6 steps from resume upload to AI-improved CV. Uses Claude Opus 4.6 with temperature 0, input sanitization, constitutional prompt with ethical principles. Stack: Next.js 16, React 19, Tailwind CSS 4, Vercel. No database. MIT licensed."
);
export { default } from "./page";
