"use client";
import Link from "next/link";

const T = {
  es: {
    back: "← Inicio", title: "Aviso de", accent: "privacidad",
    sub: "Cómo tratamos tus datos (spoiler: no los guardamos).",
    responsable: ["Responsable", "cvool.org es operado por Alfredo Arenas (Pixan.ai) desde Ciudad de México, México. Contacto: privacy@cvool.org"],
    dataTitle: "Datos que recopilamos",
    data: [
      ["Tu CV (temporal)", "Se procesa en memoria durante el análisis y se descarta inmediatamente. Nunca se almacena en disco ni base de datos."],
      ["Dirección IP (temporal)", "Se usa únicamente para rate limiting (7 req/hora). Se almacena en memoria volátil del servidor y se pierde con cada reinicio."],
      ["Analytics agregados", "Vercel Analytics recopila datos anónimos y agregados (país, dispositivo, páginas vistas). Sin cookies, sin identificadores personales."],
    ],
    purposeTitle: "Finalidades",
    purposes: ["Analizar y mejorar tu CV con IA", "Prevenir abuso del servicio (rate limiting)", "Mejorar el producto con analytics anónimos"],
    neverTitle: "Lo que NUNCA hacemos",
    never: ["Almacenar tu CV o resultados", "Crear perfiles de usuario", "Compartir datos con terceros para marketing", "Usar cookies de tracking", "Vender o monetizar tus datos"],
    arcoTitle: "Derechos ARCO (México)",
    arcoBody: "Bajo la LFPDPPP tienes derecho a:",
    arco: [["A","Acceso","Conocer qué datos tenemos"],["R","Rectificación","Corregir datos inexactos"],["C","Cancelación","Solicitar eliminación"],["O","Oposición","Oponerte al tratamiento"]],
    arcoNote: "Como no almacenamos datos personales, estos derechos se cumplen por diseño.",
    intlTitle: "Cumplimiento internacional",
    intl: [
      ["\ud83c\uddea\ud83c\uddfa","GDPR (UE)","Derecho al olvido, portabilidad, minimización. Cumplido por diseño: no hay datos que borrar."],
      ["\ud83c\udde7\ud83c\uddf7","LGPD (Brasil)","Consentimiento, acceso, eliminación. Cumplido: no almacenamos datos."],
      ["\ud83c\uddfa\ud83c\uddf8","CCPA (California)","Derecho a saber, eliminar, opt-out de venta. No vendemos datos."],
      ["\ud83c\udde8\ud83c\udde6","PIPEDA (Canadá)","Consentimiento, acceso, precisión. Cumplido por diseño."],
    ],
    intlNote: "El mismo principio aplica en todas las jurisdicciones: no almacenamos tus datos.",
    contactTitle: "Contacto", contactBody: "Para cualquier consulta sobre privacidad:",
    email: "privacy@cvool.org",
  },
  en: {
    back: "← Home", title: "Privacy", accent: "notice",
    sub: "How we handle your data (spoiler: we don\u2019t store it).",
    responsable: ["Data controller", "cvool.org is operated by Alfredo Arenas (Pixan.ai) from Mexico City, Mexico. Contact: privacy@cvool.org"],
    dataTitle: "Data we collect",
    data: [
      ["Your resume (temporary)", "Processed in memory during analysis and discarded immediately. Never stored on disk or database."],
      ["IP address (temporary)", "Used only for rate limiting (7 req/hour). Stored in volatile server memory, lost on restart."],
      ["Aggregate analytics", "Vercel Analytics collects anonymous, aggregate data (country, device, page views). No cookies, no personal identifiers."],
    ],
    purposeTitle: "Purposes",
    purposes: ["Analyze and improve your resume with AI", "Prevent service abuse (rate limiting)", "Improve the product with anonymous analytics"],
    neverTitle: "What we NEVER do",
    never: ["Store your resume or results", "Create user profiles", "Share data with third parties for marketing", "Use tracking cookies", "Sell or monetize your data"],
    arcoTitle: "ARCO Rights (Mexico)",
    arcoBody: "Under LFPDPPP you have the right to:",
    arco: [["A","Access","Know what data we have"],["R","Rectification","Correct inaccurate data"],["C","Cancellation","Request deletion"],["O","Opposition","Object to processing"]],
    arcoNote: "Since we don\u2019t store personal data, these rights are fulfilled by design.",
    intlTitle: "International compliance",
    intl: [
      ["\ud83c\uddea\ud83c\uddfa","GDPR (EU)","Right to erasure, portability, minimization. Fulfilled by design: no data to erase."],
      ["\ud83c\udde7\ud83c\uddf7","LGPD (Brazil)","Consent, access, deletion. Fulfilled: we don\u2019t store data."],
      ["\ud83c\uddfa\ud83c\uddf8","CCPA (California)","Right to know, delete, opt-out of sale. We don\u2019t sell data."],
      ["\ud83c\udde8\ud83c\udde6","PIPEDA (Canada)","Consent, access, accuracy. Fulfilled by design."],
    ],
    intlNote: "The same principle applies across all jurisdictions: we don\u2019t store your data.",
    contactTitle: "Contact", contactBody: "For any privacy inquiries:",
    email: "privacy@cvool.org",
  },
} as const;
type L = keyof typeof T;

export default function PrivacyPage() {
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
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.responsable[0]}</h2>
        <div className="border border-ink-100 rounded-lg p-4"><p className="text-sm text-ink-700 leading-relaxed">{t.responsable[1]}</p></div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.dataTitle}</h2>
        <div className="space-y-2">{t.data.map(([title, body], i) => <div key={i} className="border border-ink-100 rounded-lg p-4"><h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3><p className="text-sm text-ink-500 leading-relaxed">{body}</p></div>)}</div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.purposeTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <ul className="space-y-2">{t.purposes.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-accent shrink-0">→</span><span className="text-ink-700">{p}</span></li>)}</ul>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.neverTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <ul className="space-y-2">{t.never.map((n, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-red-500 shrink-0">✕</span><span className="text-ink-700">{n}</span></li>)}</ul>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.arcoTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <p className="text-sm text-ink-700 mb-3">{t.arcoBody}</p>
          <ul className="space-y-2">{t.arco.map(([letter, name, desc], i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-accent font-medium shrink-0">{letter}</span><span className="text-ink-700"><strong className="text-ink-900">{name}:</strong> {desc}</span></li>)}</ul>
          <p className="text-sm text-ink-500 mt-3">{t.arcoNote}</p>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.intlTitle}</h2>
        <div className="space-y-2">{t.intl.map(([flag, law, body], i) => <div key={i} className="border border-ink-100 rounded-lg p-4"><div className="flex items-start gap-3"><span className="text-lg shrink-0">{flag}</span><div><h3 className="text-sm font-medium text-ink-900 mb-0.5">{law}</h3><p className="text-sm text-ink-500 leading-relaxed">{body}</p></div></div></div>)}</div>
        <p className="text-sm text-ink-500 mt-3">{t.intlNote}</p>
      </section>
      <div className="bg-ink-050 rounded-lg p-5">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>
      <p className="text-[11px] text-ink-300">Last updated: April 2026</p>
    </div>
  );
}
