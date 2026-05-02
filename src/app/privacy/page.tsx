import { notFound } from "next/navigation";

// Deprecated: legal consolidation (May 2026). /privacy was merged into
// /legal#privacy. See note in /security/page.tsx.
// Safe to physically delete with: git rm -r src/app/privacy/
export default function PrivacyNotFound(): never {
  notFound();
}
