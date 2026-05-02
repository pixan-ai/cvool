import { notFound } from "next/navigation";

// Deprecated: legal consolidation (May 2026). /terms was merged into
// /legal#terms. See note in /security/page.tsx.
// Safe to physically delete with: git rm -r src/app/terms/
export default function TermsNotFound(): never {
  notFound();
}
