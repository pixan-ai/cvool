"use client";
import Link from "next/link";

const T = {
  es: {
    back: "\u2190 Inicio", title: "T\u00e9rminos de", accent: "uso",
    sub: "Condiciones para usar cvool.org.",
    sections: [
      { t: "Aceptaci\u00f3n", b: "Al usar cvool.org aceptas estos t\u00e9rminos. Si no est\u00e1s de acuerdo, no uses el servicio.", items: null },
      { t: "Servicio", b: null, items: ["cvool analiza y mejora CVs usando inteligencia artificial (Claude, Anthropic)", "El servicio es gratuito y sin registro", "Los resultados son sugerencias generadas por IA, no asesor\u00eda profesional", "No garantizamos que los resultados te consigan un empleo"] },
      { t: "Uso aceptable", b: null, items: ["Usa cvool para analizar y mejorar tu propio CV", "No env\u00edes contenido il\u00edcito, ofensivo o que viole derechos de terceros", "No intentes evadir el rate limiting ni abusar del servicio", "No uses bots, scrapers, ni automatizaci\u00f3n no autorizada"] },
      { t: "Propiedad intelectual", b: "Tu CV es tuyo. Los resultados generados son tuyos. El c\u00f3digo de cvool es open source (MIT). El prompt de IA es parte del c\u00f3digo p\u00fablico.", items: null },
      { t: "Privacidad", b: "No almacenamos tu CV ni datos personales. Consulta nuestro aviso de privacidad para m\u00e1s detalles.", items: null },
      { t: "Limitaci\u00f3n de responsabilidad", b: "cvool se ofrece \"tal cual\" sin garant\u00edas. No somos responsables por decisiones tomadas con base en los resultados del an\u00e1lisis.", items: null },
      { t: "Modificaciones", b: "Podemos actualizar estos t\u00e9rminos. Los cambios se publican en esta p\u00e1gina con fecha actualizada.", items: null },
      { t: "Ley aplicable", b: "Estos t\u00e9rminos se rigen por las leyes de M\u00e9xico. Cualquier disputa se resolver\u00e1 en los tribunales de la Ciudad de M\u00e9xico.", items: null },
    ],
    contactTitle: "Contacto", contactBody: "Para consultas sobre estos t\u00e9rminos:",
    email: "legal@cvool.org",
  },
  en: {
    back: "\u2190 Home", title: "Terms of", accent: "use",
    sub: "Conditions for using cvool.org.",
    sections: [
      { t: "Acceptance", b: "By using cvool.org you accept these terms. If you disagree, don\u2019t use the service.", items: null },
      { t: "Service", b: null, items: ["cvool analyzes and improves resumes using AI (Claude, Anthropic)", "The service is free and requires no registration", "Results are AI-generated suggestions, not professional advice", "We don\u2019t guarantee results will get you a job"] },
      { t: "Acceptable use", b: null, items: ["Use cvool to analyze and improve your own resume", "Don\u2019t submit illegal, offensive, or rights-violating content", "Don\u2019t attempt to bypass rate limiting or abuse the service", "Don\u2019t use bots, scrapers, or unauthorized automation"] },
      { t: "Intellectual property", b: "Your resume is yours. Generated results are yours. cvool\u2019s code is open source (MIT). The AI prompt is part of the public code.", items: null },
      { t: "Privacy", b: "We don\u2019t store your resume or personal data. See our privacy notice for details.", items: null },
      { t: "Limitation of liability", b: "cvool is provided \"as is\" without warranties. We\u2019re not liable for decisions made based on analysis results.", items: null },
      { t: "Modifications", b: "We may update these terms. Changes are posted on this page with an updated date.", items: null },
      { t: "Governing law", b: "These terms are governed by the laws of Mexico. Any disputes will be resolved in Mexico City courts.", items: null },
    ],
    contactTitle: "Contact", contactBody: "For inquiries about these terms:",
    email: "legal@cvool.org",
  },
} as const;
type L = keyof typeof T;

export default function TermsPage() {
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
      <div className="space-y-4">
        {t.sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-sm font-medium text-ink-900 mb-2">{s.t}</h2>
            <div className="border border-ink-100 rounded-lg p-4">
              {s.items ? (
                <ul className="space-y-2">{s.items.map((item, j) => <li key={j} className="flex items-start gap-2 text-sm"><span className="text-accent shrink-0">{"\u2192"}</span><span className="text-ink-700">{item}</span></li>)}</ul>
              ) : (
                <p className="text-sm text-ink-700 leading-relaxed">{s.b}</p>
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="bg-ink-050 rounded-lg p-5">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>
      <p className="text-[11px] text-ink-300">Last updated: April 2026</p>
    </div>
  );
}
