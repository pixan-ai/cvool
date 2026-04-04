"use client";
import { useState } from "react";
import Link from "next/link";

const T = {
  es: {
    back: "\u2190 Inicio", title: "Seguridad", accent: "& privacidad",
    sub: "Tu CV es tuyo. As\u00ed garantizamos que siga siendo as\u00ed.",
    sections: [
      { t: "Sin base de datos", b: "No hay una base de datos. Tu CV se procesa en tiempo real y se descarta inmediatamente. No hay nada que hackear." },
      { t: "Sin cuentas ni registro", b: "No pedimos email, nombre, ni ning\u00fan dato personal. No hay login. No hay cookies de autenticaci\u00f3n." },
      { t: "Cifrado en tr\u00e1nsito", b: "Toda comunicaci\u00f3n usa TLS/SSL. Tu CV viaja cifrado de tu navegador al servidor y de vuelta." },
      { t: "Headers de seguridad", b: "HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Mozilla Observatory: A+." },
      { t: "API key protegida", b: "La clave de API de Anthropic est\u00e1 solo en el servidor. Nunca se expone al navegador." },
      { t: "Rate limiting", b: "7 peticiones por hora por IP. Protecci\u00f3n contra abuso sin afectar el uso normal." },
      { t: "C\u00f3digo abierto", b: "Todo el c\u00f3digo es p\u00fablico y auditable en GitHub. El prompt de IA est\u00e1 en el repositorio." },
    ],
    neverTitle: "Lo que NUNCA hacemos",
    never: ["Almacenar tu CV o datos personales", "Vender o compartir informaci\u00f3n con terceros", "Usar cookies de tracking o fingerprinting", "Crear perfiles de usuario", "Entrenar modelos de IA con tu CV"],
    contactTitle: "Reportar vulnerabilidad", contactBody: "Si descubres un problema de seguridad, escr\u00edbenos:",
    email: "security@cvool.org",
  },
  en: {
    back: "\u2190 Home", title: "Security", accent: "& privacy",
    sub: "Your resume is yours. Here\u2019s how we make sure it stays that way.",
    sections: [
      { t: "No database", b: "There is no database. Your resume is processed in real time and discarded immediately. There\u2019s nothing to hack." },
      { t: "No accounts or sign-up", b: "We don\u2019t ask for email, name, or any personal data. No login. No authentication cookies." },
      { t: "Encryption in transit", b: "All communication uses TLS/SSL. Your resume travels encrypted from your browser to the server and back." },
      { t: "Security headers", b: "HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. Mozilla Observatory: A+." },
      { t: "Protected API key", b: "The Anthropic API key is server-side only. It\u2019s never exposed to the browser." },
      { t: "Rate limiting", b: "7 requests per hour per IP. Abuse protection without affecting normal use." },
      { t: "Open source", b: "All code is public and auditable on GitHub. The AI prompt is in the repository." },
    ],
    neverTitle: "What we NEVER do",
    never: ["Store your resume or personal data", "Sell or share information with third parties", "Use tracking cookies or fingerprinting", "Create user profiles", "Train AI models with your resume"],
    contactTitle: "Report a vulnerability", contactBody: "If you find a security issue, write to us:",
    email: "security@cvool.org",
  },
} as const;

export default function SecurityPage() {
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
      <div className="space-y-3">
        {t.sections.map((s, i) => (
          <div key={i} className="border border-ink-100 rounded-lg p-5">
            <h3 className="text-sm font-medium text-ink-900 mb-1">{s.t}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{s.b}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.neverTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-5">
          <ul className="space-y-3">
            {t.never.map((item, i) => <li key={i} className="flex items-start gap-3 text-sm"><span className="text-red-500 shrink-0">\u2715</span><span className="text-ink-700">{item}</span></li>)}
          </ul>
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-6">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>
    </main>
  );
}
