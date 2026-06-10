import { pageMeta } from "@/lib/metadata";
export const metadata = pageMeta(
  "map",
  ["Mapa técnico", "Technical map"],
  [
    "Cómo funciona cvool por dentro: el stack, el código y el viaje de tu CV hasta Claude y de vuelta.",
    "How cvool works under the hood: the stack, the code, and your CV's journey to Claude and back.",
  ],
  "cvool's technical architecture, explained for both beginners and experts. A Next.js 15 app that streams CV analysis from Claude Sonnet 4.6 over Server-Sent Events with zero data storage. Covers the stack, the src/ code map, the full request lifecycle, prompt caching, and the incremental JSON streaming behind the progressive UI.",
);
export { default } from "./page";
