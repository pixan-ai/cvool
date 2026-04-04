"use client";
import Link from "next/link";

const T = {
  es: {
    back: "← Inicio", title: "Seguridad", accent: "& privacidad",
    sub: "Tu CV es tuyo. Así es como lo protegemos.",
    sections: [
      ["Sin base de datos", "No almacenamos CVs, resultados, ni datos personales. Tu CV existe solo en memoria durante el análisis y se descarta inmediatamente."],
      ["Sin cuentas", "No hay registro, login, ni cookies de sesión. Nada que hackear porque no hay nada que almacenar."],
      ["TLS/SSL", "Todas las comunicaciones están cifradas en tránsito con TLS 1.3."],
      ["Headers de seguridad", "HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy."],
      ["Sanitización de input", "Bytes nulos, caracteres de control, y contenido excesivo se eliminan antes de procesar."],
      ["Rate limiting", "7 peticiones por hora por IP. Sin base de datos \u2014 en memoria."],
      ["API key protegida", "La clave de Anthropic es server-side. Nunca se expone al cliente."],
      ["Open source", "Todo el código es auditable en GitHub."],
    ],
    neverTitle: "Lo que NUNCA hacemos",
    never: ["Almacenar tu CV o datos personales", "Compartir datos con terceros para marketing", "Usar cookies de tracking o fingerprinting", "Crear perfiles de usuario", "Vender o monetizar tus datos"],
    contactTitle: "Reportar vulnerabilidades", contactBody: "Si descubres una vulnerabilidad, repórtala responsablemente.",
    email: "security@cvool.org",
  },
  en: {
    back: "← Home", title: "Security", accent: "& privacy",
    sub: "Your resume is yours. Here\u2019s how we protect it.",
    sections: [
      ["No database", "We don\u2019t store resumes, results, or personal data. Your CV exists only in memory during analysis and is discarded immediately."],
      ["No accounts", "No sign-up, no login, no session cookies. Nothing to hack because there\u2019s nothing to store."],
      ["TLS/SSL", "All communications encrypted in transit with TLS 1.3."],
      ["Security headers", "HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy."],
      ["Input sanitization", "Null bytes, control characters, and excessive content stripped before processing."],
      ["Rate limiting", "7 requests per hour per IP. No database \u2014 in-memory."],
      ["API key protected", "Anthropic key is server-side only. Never exposed to the client."],
      ["Open source", "All code is auditable on GitHub."],
    ],
    neverTitle: "What we NEVER do",
    never: ["Store your resume or personal data", "Share data with third parties for marketing", "Use tracking cookies or fingerprinting", "Create user profiles", "Sell or monetize your data"],
    contactTitle: "Report vulnerabilities", contactBody: "If you discover a vulnerability, please report it responsibly.",
    email: "security@cvool.org",
  },
} as const;
type L = keyof typeof T;

export default function SecurityPage() {
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
        <p className="text-sm text-ink-500">{t.sub}</p>
      </section>
      <div className="space-y-2">
        {t.sections.map(([title, body], i) => (
          <div key={i} className="border border-ink-100 rounded-lg p-4">
            <h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3>
            <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.neverTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <ul className="space-y-2">{t.never.map((item, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-red-500 shrink-0">✕</span><span className="text-ink-700">{item}</span></li>)}</ul>
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-5">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>
    </div>
  );
}
