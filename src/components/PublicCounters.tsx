"use client";

import { useEffect, useState } from "react";
import { t } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

// Public, verifiable counters via abacus.jasoncameron.dev (open source, no DB).
// Anyone can audit the values directly:
//   https://abacus.jasoncameron.dev/get/cvool/visits
//   https://abacus.jasoncameron.dev/get/cvool/cvs-analyzed
const NS = "cvool";
const HIT = (key: string) => `https://abacus.jasoncameron.dev/hit/${NS}/${key}`;
const GET = (key: string) => `https://abacus.jasoncameron.dev/get/${NS}/${key}`;

const VERIFY_TITLE: Record<Lang, string> = {
  es: "Verifica este contador público",
  en: "Verify this public counter",
  fr: "Vérifier ce compteur public",
  pt: "Verifique este contador público",
  it: "Verifica questo contatore pubblico",
};

function format(n: number, lang: Lang): string {
  try {
    return new Intl.NumberFormat(lang).format(n);
  } catch {
    return n.toLocaleString();
  }
}

// Fetches a counter once on mount. Pass GET() to read without incrementing,
// HIT() to increment-and-read.
function useCounter(url: string): number | null {
  const [n, setN] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && typeof d?.value === "number") setN(d.value);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);
  return n;
}

/**
 * Number rendered inside the social-proof pill on the input screen. Reads
 * (does not increment) on mount. The increment hit is fired from page.tsx
 * the moment a result is received, because this component unmounts during
 * the analysis flow. When the user returns to the input screen, the
 * component re-mounts and fetches the fresh count.
 *
 * Sized to sit inline with the pill label (text-sm), not as a hero number.
 */
export function CvsAnalyzedCount({ lang }: { lang: Lang }) {
  const n = useCounter(GET("cvs-analyzed"));
  return (
    <a
      href={GET("cvs-analyzed")}
      target="_blank"
      rel="noopener noreferrer"
      title={VERIFY_TITLE[lang] ?? VERIFY_TITLE.es}
      className="text-sm font-medium text-ink-900 tabular-nums hover:text-ink-600 transition"
    >
      {n === null ? "—" : format(n, lang)}
    </a>
  );
}

/**
 * Tiny line for the footer: "Visitas: 1,234 · Contadores públicos verificables"
 * Increments visits on mount (counts every page load, including bots — by design).
 */
export function FooterPublicCounters({ lang }: { lang: Lang }) {
  const ui = t(lang);
  const visits = useCounter(HIT("visits"));
  return (
    <p className="text-[11px] text-ink-300 text-center">
      <a
        href={GET("visits")}
        target="_blank"
        rel="noopener noreferrer"
        title={VERIFY_TITLE[lang] ?? VERIFY_TITLE.es}
        className="hover:text-ink-500 transition tabular-nums"
      >
        {ui.counterVisits}: {visits === null ? "—" : format(visits, lang)}
      </a>
      <span className="mx-1.5">·</span>
      <span>{ui.counterPublicVerify}</span>
    </p>
  );
}
