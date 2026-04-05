import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
export const metadata: Metadata = pageMetadata(
  "terms",
  "T\u00e9rminos de uso",
  "Terms of use",
  "Condiciones para usar cvool.org.",
  "Conditions for using cvool.org.",
  "cvool terms: free service, no registration, AI-generated suggestions (not professional advice). Your resume is yours, generated results are yours. Code is MIT. Governed by Mexican law, Mexico City courts."
);
export { default } from "./page";
