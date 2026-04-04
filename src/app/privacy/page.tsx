"use client";
import { useState } from "react";
import Link from "next/link";

const T = {
  es: {
    back: "\u2190 Inicio", title: "Aviso de", accent: "privacidad",
    sub: "C\u00f3mo tratamos tu informaci\u00f3n personal. Respuesta corta: no la almacenamos.",
    responsableTitle: "Responsable",
    responsable: "cvool (cvool.org) es operado por Alfredo Arenas (Pixan.ai). El servicio se proporciona desde M\u00e9xico. Contacto: privacy@cvool.org",
    dataTitle: "Datos que procesamos",
    data: [
      ["Tu CV", "Se procesa en tiempo real para el an\u00e1lisis con IA y se descarta inmediatamente. Nunca se almacena en disco, base de datos, ni logs."],
      ["Tu IP", "Se usa \u00fanicamente para rate limiting (7 peticiones/hora). Se almacena en memoria vol\u00e1til y se elimina autom\u00e1ticamente."],
      ["Analytics", "Vercel Analytics recopila datos an\u00f3nimos y agregados (p\u00e1ginas vistas, pa\u00eds). Sin cookies, sin identificadores personales."],
    ],
    neverTitle: "Lo que NUNCA hacemos",
    never: ["Almacenar tu CV en ning\u00fan medio", "Crear una cuenta o perfil con tus datos", "Compartir informaci\u00f3n con terceros para marketing", "Usar cookies de tracking o fingerprinting", "Entrenar modelos de IA con tu informaci\u00f3n"],
    arcoTitle: "Tus derechos (ARCO)",
    arco: "En M\u00e9xico tienes derechos de Acceso, Rectificaci\u00f3n, Cancelaci\u00f3n y Oposici\u00f3n (ARCO) bajo la LFPDPPP. Como no almacenamos datos personales, estos derechos se cumplen por dise\u00f1o. Si tienes preguntas: privacy@cvool.org",
    intlTitle: "Cumplimiento internacional",
    intl: [
      ["\ud83c\uddea\ud83c\uddfa GDPR", "Uni\u00f3n Europea", "No almacenamos datos personales. No hay base legal requerida porque no hay procesamiento persistente."],
      ["\ud83c\udde7\ud83c\uddf7 LGPD", "Brasil", "Cumplimiento por dise\u00f1o: sin almacenamiento = sin obligaciones de retenci\u00f3n."],
      ["\ud83c\uddfa\ud83c\uddf8 CCPA", "California", "No vendemos ni compartimos informaci\u00f3n personal. No hay datos que reportar."],
      ["\ud83c\udde8\ud83c\udde6 PIPEDA", "Canad\u00e1", "Consentimiento impl\u00edcito por uso. Sin retenci\u00f3n de datos personales."],
    ],
    contactTitle: "Contacto", contactBody: "Para preguntas sobre privacidad:",
    email: "privacy@cvool.org",
    updated: "\u00daltima actualizaci\u00f3n: Abril 2026",
  },
  en: {
    back: "\u2190 Home", title: "Privacy", accent: "notice",
    sub: "How we handle your personal information. Short answer: we don\u2019t store it.",
    responsableTitle: "Data controller",
    responsable: "cvool (cvool.org) is operated by Alfredo Arenas (Pixan.ai). The service is provided from Mexico. Contact: privacy@cvool.org",
    dataTitle: "Data we process",
    data: [
      ["Your resume", "Processed in real time for AI analysis and discarded immediately. Never stored on disk, database, or logs."],
      ["Your IP", "Used solely for rate limiting (7 requests/hour). Stored in volatile memory and automatically deleted."],
      ["Analytics", "Vercel Analytics collects anonymous, aggregate data (page views, country). No cookies, no personal identifiers."],
    ],
    neverTitle: "What we NEVER do",
    never: ["Store your resume in any medium", "Create an account or profile with your data", "Share information with third parties for marketing", "Use tracking cookies or fingerprinting", "Train AI models with your information"],
    arcoTitle: "Your rights",
    arco: "Under Mexico\u2019s LFPDPPP you have ARCO rights (Access, Rectification, Cancellation, Opposition). Since we don\u2019t store personal data, these rights are fulfilled by design. Questions: privacy@cvool.org",
    intlTitle: "International compliance",
    intl: [
      ["\ud83c\uddea\ud83c\uddfa GDPR", "European Union", "We don\u2019t store personal data. No legal basis required because there\u2019s no persistent processing."],
      ["\ud83c\udde7\ud83c\uddf7 LGPD", "Brazil", "Compliance by design: no storage = no retention obligations."],
      ["\ud83c\uddfa\ud83c\uddf8 CCPA", "California", "We don\u2019t sell or share personal information. No data to report."],
      ["\ud83c\udde8\ud83c\udde6 PIPEDA", "Canada", "Implied consent by use. No personal data retention."],
    ],
    contactTitle: "Contact", contactBody: "For privacy questions:",
    email: "privacy@cvool.org",
    updated: "Last updated: April 2026",
  },
} as const;

export default function PrivacyPage() {
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
        <h2 className="text-lg font-medium text-ink-900 mb-3">{t.responsableTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-5"><p className="text-sm text-ink-700 leading-relaxed">{t.responsable}</p></div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-3">{t.dataTitle}</h2>
        <div className="space-y-3">
          {t.data.map(([title, body], i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-5">
              <h3 className="text-sm font-medium text-ink-900 mb-1">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.neverTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-5">
          <ul className="space-y-3">
            {t.never.map((item, i) => <li key={i} className="flex items-start gap-3 text-sm"><span className="text-red-500 shrink-0">\u2715</span><span className="text-ink-700">{item}</span></li>)}
          </ul>
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-3">{t.arcoTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-5"><p className="text-sm text-ink-700 leading-relaxed">{t.arco}</p></div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-3">{t.intlTitle}</h2>
        <div className="space-y-3">
          {t.intl.map(([flag, region, body], i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-5">
              <h3 className="text-sm font-medium text-ink-900 mb-0.5">{flag}</h3>
              <p className="text-xs text-ink-400 mb-2">{region}</p>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-6">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>
      <p className="text-xs text-ink-300">{t.updated}</p>
    </main>
  );
}
