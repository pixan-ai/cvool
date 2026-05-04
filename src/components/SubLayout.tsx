"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { GitHubIcon, XIcon, BuyMeACoffeeIcon } from "@/components/icons";
import { FaviconIcon } from "@/components/FaviconIcon";

type Lang = "es" | "en";

export function SubHeader({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="flex items-center justify-between">
      <span className="inline-flex items-center gap-[2px] font-[family-name:var(--font-geist)] text-[24px] font-medium tracking-tight">
        <FaviconIcon size="w-[25px] h-[25px]" />
        <span className="text-ink-900">cv</span><span className="text-accent">ool</span>
      </span>
      <div className="flex items-center gap-3">
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
          className="text-xs font-medium text-ink-500 bg-transparent border border-ink-100 rounded-lg px-2 py-1 focus:outline-none focus:border-accent cursor-pointer">
          <option value="es">ES</option>
          <option value="en">EN</option>
        </select>
        <Link href="/" className="text-xs text-ink-400 hover:text-accent transition">{lang === "es" ? "\u2190 Inicio" : "\u2190 Home"}</Link>
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
        <Link href="/legal" className="hover:text-ink-700 transition">Legal</Link>
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
        <span className="font-medium"><span className="text-ink-700">cv</span><span className="text-accent">ool</span></span>
        <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="GitHub">
          <GitHubIcon />
        </a>
        <a href="https://x.com/cvoolorg" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="X">
          <XIcon />
        </a>
        <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")} className="hover:text-ink-600 transition">
          <BuyMeACoffeeIcon />
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
