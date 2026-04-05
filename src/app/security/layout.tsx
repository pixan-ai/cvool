import type { Metadata } from "next";
import { pageMetadata } from "@/lib/metadata";
export const metadata: Metadata = pageMetadata(
  "security",
  "Seguridad",
  "Security",
  "Pr\u00e1cticas de seguridad de cvool: sin base de datos, TLS, headers, rate limiting.",
  "cvool security practices: no database, TLS 1.3, security headers, rate limiting.",
  "cvool security: no database (zero data stored), no accounts, TLS 1.3, HSTS, X-Frame-Options, input sanitization, rate limiting (7 req/hr), API key server-side only. All code auditable on GitHub. Report vulnerabilities to security@cvool.org."
);
export { default } from "./page";
