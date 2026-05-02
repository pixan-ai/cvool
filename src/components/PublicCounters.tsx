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
const PUBLIC_URL = (key: string) => `https://abacus.jasoncameron.dev/get/${NS}/${key}`;

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

async function fetchValue(url: string): Promise<number | null> {
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    const d = await r.json();
    return typeof d?.value === "number" ? d.value : null;
  } catch {
    return null;
  }
}

/**
 * Big number for the social proof slot. Reads (does not increment) on mount.
 * The increment hit is fired directly from page.tsx the moment a result is
 * received, because this component unmounts during the analysis flow.
 * When the user returns to the input screen, the component re-mounts and
 * fetches the fresh count.
 */
export function CvsAnalyzedCount({ lang }: { lang: Lang }) {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetchValue(GET("cvs-analyzed")).then((v) => {
      if (alive && v !== null) setN(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      href={PUBLIC_URL("cvs-analyzed")}
      target="_blank"
      rel="noopener noreferrer"
      title={VERIFY_TITLE[lang] ?? VERIFY_TITLE.es}
      className="text-xl font-medium text-ink-900 tracking-tight tabular-nums hover:text-ink-600 transition"
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
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    fetchValue(HIT("visits")).then((v) => {
      if (alive && v !== null) setVisits(v);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <p className="text-[11px] text-ink-300 text-center">
      <a
        href={PUBLIC_URL("visits")}
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
