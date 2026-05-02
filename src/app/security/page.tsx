import { notFound } from "next/navigation";

// Deprecated: legal consolidation (May 2026). /security was merged into
// /legal#security. The redirect in next.config.ts intercepts requests
// before this file is reached — the notFound() is a defensive fallback
// in case the redirect rule is ever removed without removing this file.
// Safe to physically delete with: git rm -r src/app/security/
export default function SecurityNotFound(): never {
  notFound();
}
