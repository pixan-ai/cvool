import { notFound } from "next/navigation";

// Deprecated: kill-v2 cleanup (May 2026). The /v2 alternative UI flow was
// retired in favor of the main page at /. notFound() makes /v2 return 404 —
// functionally equivalent to deleting the route. The /v2 directory itself
// can be physically removed later with:
//   git rm -r src/app/v2/
export default function V2NotFound(): never {
  notFound();
}
