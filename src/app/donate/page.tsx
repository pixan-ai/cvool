"use client";
import { useState } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";

const T = {
  es: {
    back: "\u2190 Inicio", title: "Apoya", accent: "cvool",
    sub: "cvool es gratis y siempre lo ser\u00e1. Tu donaci\u00f3n ayuda a pagar los tokens de IA y mantener el servicio activo.",
    whyTitle: "\u00bfA d\u00f3nde va tu donaci\u00f3n?",
    why: [
      ["Tokens de IA", "Cada an\u00e1lisis usa Claude Opus (Anthropic). Cuesta ~$0.05 USD por CV. Tu donaci\u00f3n cubre estos costos directamente."],
      ["Infraestructura", "Hosting en Vercel, dominio cvool.org, certificados SSL. Todo lo que mantiene el servicio en l\u00ednea."],
      ["Desarrollo", "Nuevas funciones, m\u00e1s idiomas, mejor calidad de an\u00e1lisis. Todo el c\u00f3digo sigue siendo open source."],
    ],
    ctaTitle: "Invita un caf\u00e9",
    ctaSub: "Cualquier monto ayuda. Un caf\u00e9 = ~5 CVs analizados.",
    ctaBtn: "Donar en Buy Me a Coffee",
    promiseTitle: "Nuestra promesa",
    promise: ["cvool siempre ser\u00e1 gratuito para todos", "Nunca pondremos features detr\u00e1s de un paywall", "Cada peso se usa en tokens, stack y mejoras", "El c\u00f3digo seguir\u00e1 siendo open source (MIT)"],
    bottomTitle: "\u00bfTe ayud\u00f3 a conseguir trabajo?",
    bottomBody: "Si cvool te ayud\u00f3 a conseguir esa entrevista o ese trabajo, se vale regresar.",
    bottomLink: "Donar",
  },
  en: {
    back: "\u2190 Home", title: "Support", accent: "cvool",
    sub: "cvool is free and always will be. Your donation helps pay for AI tokens and keep the service running.",
    whyTitle: "Where does your donation go?",
    why: [
      ["AI tokens", "Each analysis uses Claude Opus (Anthropic). It costs ~$0.05 USD per resume. Your donation covers these costs directly."],
      ["Infrastructure", "Hosting on Vercel, cvool.org domain, SSL certificates. Everything that keeps the service online."],
      ["Development", "New features, more languages, better analysis quality. All code remains open source."],
    ],
    ctaTitle: "Buy us a coffee",
    ctaSub: "Any amount helps. One coffee \u2248 5 resumes analyzed.",
    ctaBtn: "Donate on Buy Me a Coffee",
    promiseTitle: "Our promise",
    promise: ["cvool will always be free for everyone", "We\u2019ll never put features behind a paywall", "Every dollar goes to tokens, stack, and improvements", "The code will remain open source (MIT)"],
    bottomTitle: "Did it help you land a job?",
    bottomBody: "If cvool helped you get that interview or that job, feel free to come back.",
    bottomLink: "Donate",
  },
} as const;

export default function DonatePage() {
  const [lang, setLang] = useState<"es"|"en">("es");
  const t = T[lang];
  return (
    <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xs text-ink-400 hover:text-accent transition">{t.back}</Link>
        <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="text-xs font-medium text-ink-500 border border-ink-100 rounded-lg px-2 py-1 hover:border-accent cursor-pointer">{lang.toUpperCase()}</button>
      </div>
      <section className="text-center">
        <h1 className="text-3xl font-light tracking-tight text-ink-900">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500 mt-2 max-w-lg mx-auto leading-relaxed">{t.sub}</p>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.whyTitle}</h2>
        <div className="space-y-3">
          {t.why.map(([title, body], i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-5">
              <h3 className="text-sm font-medium text-ink-900 mb-1">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="border border-accent/20 rounded-lg p-6 text-center">
        <p className="text-sm text-ink-700 font-medium mb-1">{t.ctaTitle}</p>
        <p className="text-sm text-ink-500 mb-5 max-w-md mx-auto">{t.ctaSub}</p>
        <a href="https://buymeacoffee.com/alfredoarenas" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")}
          className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent-dim transition">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 110 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
            <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
          </svg>
          {t.ctaBtn}
        </a>
      </div>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.promiseTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-5">
          <ul className="space-y-3">
            {t.promise.map((item, i) => <li key={i} className="flex items-start gap-3 text-sm"><span className="text-positive shrink-0">\u2713</span><span className="text-ink-700">{item}</span></li>)}
          </ul>
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-6 text-center">
        <p className="text-sm text-ink-700 font-medium mb-2">{t.bottomTitle}</p>
        <p className="text-sm text-ink-500 mb-4">{t.bottomBody}</p>
        <a href="https://buymeacoffee.com/alfredoarenas" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")}
          className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.bottomLink} \u2192</a>
      </div>
    </main>
  );
}
