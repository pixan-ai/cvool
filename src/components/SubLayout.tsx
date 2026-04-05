"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

type Lang = "es" | "en";

export function SubHeader({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="text-xs text-ink-400 hover:text-accent transition">{lang === "es" ? "← Inicio" : "← Home"}</Link>
      <div className="flex items-center gap-3">
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
          className="text-xs font-medium text-ink-500 bg-transparent border border-ink-100 rounded-lg px-2 py-1 focus:outline-none focus:border-accent cursor-pointer">
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
        <span className="font-[family-name:var(--font-geist)] text-lg font-medium tracking-tight">
          <span className="text-ink-900">cv</span><span className="text-accent">ool</span>
        </span>
      </div>
    </header>
  );
}

export function SubFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="pt-8 pb-4 space-y-3">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-xs text-ink-400">
        <Link href="/how" className="hover:text-ink-700 transition">{lang === "es" ? "C\u00f3mo funciona" : "How it works"}</Link>
        <Link href="/about" className="hover:text-ink-700 transition">{lang === "es" ? "Sobre m\u00ed" : "About"}</Link>
        <Link href="/security" className="hover:text-ink-700 transition">{lang === "es" ? "Seguridad" : "Security"}</Link>
        <Link href="/privacy" className="hover:text-ink-700 transition">{lang === "es" ? "Privacidad" : "Privacy"}</Link>
        <Link href="/terms" className="hover:text-ink-700 transition">{lang === "es" ? "T\u00e9rminos" : "Terms"}</Link>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
        <span className="font-medium"><span className="text-ink-700">cv</span><span className="text-accent">ool</span></span>
        <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="GitHub">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
        </a>
        <a href="https://x.com/maxcvorg" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="X">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        </a>
        <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")} className="hover:text-ink-600 transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 110 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
          </svg>
        </a>
      </div>
    </footer>
  );
}

export function useSubLang(): [Lang, (l: Lang) => void] {
  const [lang, setLang] = useState<Lang>(() =>
    typeof window !== "undefined" && navigator.language.startsWith("en") ? "en" : "es"
  );
  return [lang, setLang];
}
