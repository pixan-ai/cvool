"use client";
import Link from "next/link";
import { track } from "@vercel/analytics";

const T = {
  es: {
    back: "← Inicio", title: "Apoya", accent: "cvool",
    sub: "cvool es gratis para siempre. Tu donación cubre tokens de IA, infraestructura y desarrollo.",
    whyTitle: "¿A dónde va tu donación?",
    why: [
      ["Tokens de IA", "Cada análisis usa Claude Opus 4.6 de Anthropic. Cada CV cuesta ~$0.05 USD en tokens."],
      ["Infraestructura", "Vercel hosting, dominio cvool.org, SSL, analytics."],
      ["Desarrollo", "Nuevas funcionalidades, más idiomas, mejor prompt."],
    ],
    ctaTitle: "Invita un café",
    ctaSub: "Cualquier monto ayuda a mantener cvool gratis para todos.",
    ctaBtn: "Donar en Buy Me a Coffee",
    promiseTitle: "Nuestra promesa",
    promises: ["cvool siempre será gratis", "Tu CV nunca se almacena", "El código siempre será open source", "Donar es 100% voluntario, sin presión"],
    bottomTitle: "Gracias", bottomBody: "Si cvool te ayudó a conseguir ese trabajo, ya valió toda la desvelada.",
  },
  en: {
    back: "← Home", title: "Support", accent: "cvool",
    sub: "cvool is free forever. Your donation covers AI tokens, infrastructure, and development.",
    whyTitle: "Where does your donation go?",
    why: [
      ["AI tokens", "Each analysis uses Claude Opus 4.6 by Anthropic. Each resume costs ~$0.05 USD in tokens."],
      ["Infrastructure", "Vercel hosting, cvool.org domain, SSL, analytics."],
      ["Development", "New features, more languages, better prompts."],
    ],
    ctaTitle: "Buy me a coffee",
    ctaSub: "Any amount helps keep cvool free for everyone.",
    ctaBtn: "Donate on Buy Me a Coffee",
    promiseTitle: "Our promise",
    promises: ["cvool will always be free", "Your resume is never stored", "Code will always be open source", "Donating is 100% voluntary, no pressure"],
    bottomTitle: "Thank you", bottomBody: "If cvool helped you land that job, every late night was worth it.",
  },
} as const;
type L = keyof typeof T;

export default function DonatePage() {
  const lang: L = typeof window !== "undefined" && navigator.language.startsWith("en") ? "en" : "es";
  const t = T[lang];
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-xs text-ink-400 hover:text-accent transition">{t.back}</Link>
        <span className="font-[family-name:var(--font-geist)] text-lg font-medium tracking-tight"><span className="text-ink-900">cv</span><span className="text-accent">ool</span></span>
      </header>
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500 max-w-md mx-auto">{t.sub}</p>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.whyTitle}</h2>
        <div className="space-y-2">
          {t.why.map(([title, body], i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="border border-accent/20 rounded-lg p-6 text-center">
        <p className="text-sm text-ink-700 font-medium mb-1">{t.ctaTitle}</p>
        <p className="text-sm text-ink-500 mb-4 max-w-sm mx-auto">{t.ctaSub}</p>
        <a href="https://buymeacoffee.com/alfredoarenas" target="_blank" rel="noopener noreferrer"
          onClick={() => track("donation_clicked")}
          className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent-dim transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 110 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          {t.ctaBtn}
        </a>
      </div>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.promiseTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <ul className="space-y-2">{t.promises.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-positive shrink-0">✓</span><span className="text-ink-700">{p}</span></li>)}</ul>
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-5 text-center">
        <p className="text-sm text-ink-700 font-medium mb-1">{t.bottomTitle}</p>
        <p className="text-sm text-ink-500">{t.bottomBody}</p>
      </div>
    </div>
  );
}
