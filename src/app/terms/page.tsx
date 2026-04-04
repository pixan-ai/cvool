"use client";
import { useState } from "react";
import Link from "next/link";

const T = {
  es: {
    back: "\u2190 Inicio", title: "T\u00e9rminos de", accent: "uso",
    sub: "Condiciones para usar cvool.org. Son cortas porque el servicio es simple.",
    sections: [
      { t: "Servicio", b: "cvool es un servicio gratuito de an\u00e1lisis y mejora de CVs con inteligencia artificial. No requiere registro ni almacena datos personales. El servicio se proporciona \u201ccomo est\u00e1\u201d sin garant\u00edas expl\u00edcitas ni impl\u00edcitas." },
      { t: "Uso aceptable", items: ["Analizar y mejorar tu propio CV o el de alguien que te haya dado permiso", "Usar los resultados para tu b\u00fasqueda de empleo personal", "Compartir el servicio con otras personas que busquen empleo"] },
      { t: "Uso no aceptable", items: ["Enviar contenido que no sea un CV (spam, malware, contenido ilegal)", "Intentar acceder a datos de otros usuarios (no los hay)", "Automatizar peticiones masivas para evadir el rate limiting", "Usar el servicio para discriminar o perjudicar a candidatos"] },
      { t: "Propiedad intelectual", b: "Tu CV es tuyo. Nunca lo almacenamos ni lo usamos para ning\u00fan otro prop\u00f3sito. El c\u00f3digo de cvool es open source bajo licencia MIT. El contenido generado por la IA es tuyo para usar libremente." },
      { t: "Limitaci\u00f3n de responsabilidad", b: "cvool no garantiza que los resultados del an\u00e1lisis sean perfectos ni que mejoren tus posibilidades de empleo. Las sugerencias son orientativas. Siempre revisa el CV mejorado antes de usarlo." },
      { t: "Cambios", b: "Podemos modificar estos t\u00e9rminos. La versi\u00f3n vigente siempre est\u00e1 en cvool.org/terms." },
    ],
    contactTitle: "Contacto", contactBody: "Para preguntas sobre estos t\u00e9rminos:",
    email: "legal@cvool.org", updated: "\u00daltima actualizaci\u00f3n: Abril 2026",
  },
  en: {
    back: "\u2190 Home", title: "Terms of", accent: "use",
    sub: "Conditions for using cvool.org. They\u2019re short because the service is simple.",
    sections: [
      { t: "Service", b: "cvool is a free AI-powered resume analysis and improvement service. It requires no registration and stores no personal data. The service is provided \u201cas is\u201d without express or implied warranties." },
      { t: "Acceptable use", items: ["Analyze and improve your own resume or someone\u2019s who gave you permission", "Use the results for your personal job search", "Share the service with other job seekers"] },
      { t: "Unacceptable use", items: ["Submit content that isn\u2019t a resume (spam, malware, illegal content)", "Attempt to access other users\u2019 data (there is none)", "Automate mass requests to evade rate limiting", "Use the service to discriminate against or harm candidates"] },
      { t: "Intellectual property", b: "Your resume is yours. We never store it or use it for any other purpose. cvool\u2019s code is open source under the MIT license. AI-generated content is yours to use freely." },
      { t: "Limitation of liability", b: "cvool does not guarantee that analysis results are perfect or that they will improve your employment prospects. Suggestions are guidance only. Always review the improved resume before using it." },
      { t: "Changes", b: "We may modify these terms. The current version is always at cvool.org/terms." },
    ],
    contactTitle: "Contact", contactBody: "For questions about these terms:",
    email: "legal@cvool.org", updated: "Last updated: April 2026",
  },
} as const;

export default function TermsPage() {
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
      <div className="space-y-6">
        {t.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-medium text-ink-900 mb-3">{s.t}</h2>
            <div className="border border-ink-100 rounded-lg p-5">
              {"items" in s && s.items ? (
                <ul className="space-y-3">{s.items.map((item, j) => <li key={j} className="flex items-start gap-3 text-sm"><span className="text-accent shrink-0">\u2192</span><span className="text-ink-700">{item}</span></li>)}</ul>
              ) : "b" in s ? <p className="text-sm text-ink-700 leading-relaxed">{s.b}</p> : null}
            </div>
          </section>
        ))}
      </div>
      <div className="bg-ink-050 rounded-lg p-6">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>
      <p className="text-xs text-ink-300">{t.updated}</p>
    </main>
  );
}
