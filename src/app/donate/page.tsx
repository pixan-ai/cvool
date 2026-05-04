"use client";
import Image from "next/image";
import { useState } from "react";
import { track } from "@vercel/analytics";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";
import { BuyMeACoffeeIcon } from "@/components/icons";

const T = {
  es: {
    title: "Apoya", accent: "cvool",
    sub: "cvool es gratis para siempre. Tu donaci\u00f3n cubre tokens de IA, infraestructura y desarrollo.",
    whyTitle: "\u00bfA d\u00f3nde va tu donaci\u00f3n?",
    why: [
      ["Tokens de IA", "Cada an\u00e1lisis usa Claude Sonnet 4.6 de Anthropic. Cada CV cuesta ~$0.05 USD en tokens."],
      ["Infraestructura", "Vercel hosting, dominio cvool.org, SSL, analytics."],
      ["Desarrollo", "Nuevas funcionalidades, m\u00e1s idiomas, mejor prompt."],
    ],
    ctaTitle: "Invita un caf\u00e9",
    ctaSub: "Cualquier monto ayuda a mantener cvool gratis para todos.",
    ctaBtn: "Donar en Buy Me a Coffee",
    bmcPill: "\u00bfQu\u00e9 es Buy Me a Coffee?",
    bmcExplain: "Buy Me a Coffee es una plataforma segura para recibir donaciones. Acepta tarjetas de cr\u00e9dito/d\u00e9bito, Apple Pay y Google Pay a trav\u00e9s de Stripe. No necesitas crear cuenta para donar.",
    qrLabel: "Escanea para donar desde tu celular",
    promiseTitle: "Nuestra promesa",
    promises: ["cvool siempre ser\u00e1 gratis", "Tu CV nunca se almacena", "El c\u00f3digo siempre ser\u00e1 open source", "Donar es 100% voluntario, sin presi\u00f3n"],
    bottomTitle: "\u00a1Gracias!",
    bottomBody: "Si cvool te ayud\u00f3 a conseguir ese trabajo, todo nuestro esfuerzo vali\u00f3 la pena.",
    contactLabel: "Contacto:",
    email: "alfredo@cvool.org",
  },
  en: {
    title: "Support", accent: "cvool",
    sub: "cvool is free forever. Your donation covers AI tokens, infrastructure, and development.",
    whyTitle: "Where does your donation go?",
    why: [
      ["AI tokens", "Each analysis uses Claude Sonnet 4.6 by Anthropic. Each resume costs ~$0.05 USD in tokens."],
      ["Infrastructure", "Vercel hosting, cvool.org domain, SSL, analytics."],
      ["Development", "New features, more languages, better prompts."],
    ],
    ctaTitle: "Buy me a coffee",
    ctaSub: "Any amount helps keep cvool free for everyone.",
    ctaBtn: "Donate on Buy Me a Coffee",
    bmcPill: "What is Buy Me a Coffee?",
    bmcExplain: "Buy Me a Coffee is a secure donation platform. It accepts credit/debit cards, Apple Pay, and Google Pay via Stripe. No account needed to donate.",
    qrLabel: "Scan to donate from your phone",
    promiseTitle: "Our promise",
    promises: ["cvool will always be free", "Your resume is never stored", "Code will always be open source", "Donating is 100% voluntary, no pressure"],
    bottomTitle: "Thank you!",
    bottomBody: "If cvool helped you land that job, every bit of effort was worth it.",
    contactLabel: "Contact:",
    email: "alfredo@cvool.org",
  },
} as const;

export default function DonatePage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];
  const [showBmcInfo, setShowBmcInfo] = useState(false);
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500 max-w-md mx-auto"><CvoolText text={t.sub} /></p>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.whyTitle}</h2>
        <div className="border border-ink-100 rounded-lg divide-y divide-ink-100">
          {t.why.map(([title, body], i) => (
            <div key={i} className="p-4">
              <h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="border border-accent/20 rounded-lg p-6 text-center space-y-4">
        <p className="text-sm text-ink-700 font-medium mb-1">{t.ctaTitle}</p>
        <p className="text-sm text-ink-500 max-w-sm mx-auto"><CvoolText text={t.ctaSub} /></p>
        <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer"
          onClick={() => track("donation_clicked")}
          className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent-dim transition">
          <BuyMeACoffeeIcon />
          {t.ctaBtn}
        </a>
        <div>
          <button onClick={() => setShowBmcInfo(!showBmcInfo)}
            className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-600 transition cursor-pointer border border-ink-100 rounded-full px-3 py-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {t.bmcPill}
          </button>
          {showBmcInfo && (
            <p className="text-xs text-ink-400 mt-2 max-w-sm mx-auto leading-relaxed donation-fade-in">{t.bmcExplain}</p>
          )}
        </div>
        <div className="pt-2">
          <Image src="/bmc-qr.png" alt="Buy Me a Coffee QR" width={140} height={140} className="mx-auto rounded-lg" />
          <p className="text-[11px] text-ink-300 mt-2">{t.qrLabel}</p>
        </div>
      </div>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.promiseTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <ul className="space-y-2">{t.promises.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-positive shrink-0">\u2713</span><span className="text-ink-700"><CvoolText text={p} /></span></li>)}</ul>
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-5 text-center space-y-2">
        <p className="text-sm text-ink-900 font-bold">{t.bottomTitle}</p>
        <p className="text-sm text-ink-500"><CvoolText text={t.bottomBody} /></p>
        <p className="text-xs text-ink-400">{t.contactLabel} <a href={`mailto:${t.email}`} className="text-accent hover:text-accent-dim transition">{t.email}</a></p>
      </div>
      <SubFooter lang={lang} />
    </div>
  );
}
