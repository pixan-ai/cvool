import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
export const metadata: Metadata = pageMetadata(
  "donate",
  "Apoya cvool",
  "Support cvool",
  "cvool es gratis para siempre. Tu donaci\u00f3n cubre tokens de IA, infraestructura y desarrollo.",
  "cvool is free forever. Your donation covers AI tokens, infrastructure, and development.",
  "Support cvool: each resume analysis costs ~$0.05 USD in Claude Sonnet 4.6 tokens. Donations via Buy Me a Coffee (https://buymeacoffee.com/cvool) cover AI tokens, Vercel hosting, domain, and development. cvool will always be free, anonymous, and open source."
);
export { default } from "./page";
