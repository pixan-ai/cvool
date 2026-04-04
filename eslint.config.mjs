import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

// NOTE: Next.js 15 has a known circular JSON bug with flat config during build.
// Lint works fine via `npx next lint` standalone. The build warning is cosmetic.
export default [...compat.extends("next/core-web-vitals")];
