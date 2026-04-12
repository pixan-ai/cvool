"use client";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";

const T = {
  es: {
    title: "Términos de", accent: "uso",
    sub: "Condiciones para usar cvool.org.",
    sections: [
      { t: "Aceptación", b: "Al usar cvool.org aceptas estos términos. Si no estás de acuerdo, no uses el servicio.", items: null },
      { t: "Servicio", b: null, items: ["cvool analiza y mejora CVs usando inteligencia artificial (Claude, Anthropic)", "El servicio es gratuito y sin registro", "Los resultados son sugerencias generadas por IA, no asesoría profesional", "No garantizamos que los resultados te consigan un empleo"] },
      { t: "Uso aceptable", b: null, items: ["Usa cvool para analizar y mejorar tu propio CV", "No envíes contenido ilícito, ofensivo o que viole derechos de terceros", "No intentes evadir el rate limiting ni abusar del servicio", "No uses bots, scrapers, ni automatización no autorizada"] },
      { t: "Propiedad intelectual", b: "Tu CV es tuyo. Los resultados generados son tuyos. El código de cvool es open source (MIT). El prompt de IA es parte del código público.", items: null },
      { t: "Privacidad", b: "No almacenamos tu CV ni datos personales. Consulta nuestro aviso de privacidad para más detalles.", items: null },
      { t: "Limitación de responsabilidad", b: "cvool se ofrece \"tal cual\" sin garantías. No somos responsables por decisiones tomadas con base en los resultados del análisis.", items: null },
      { t: "Modificaciones", b: "Podemos actualizar estos términos. Los cambios se publican en esta página con fecha actualizada.", items: null },
      { t: "Ley aplicable", b: "Estos términos se rigen por las leyes de México. Cualquier disputa se resolverá en los tribunales de la Ciudad de México.", items: null },
    ],
    contactTitle: "Contacto", contactBody: "Para consultas sobre estos términos:",
    email: "security@cvool.org",
  },
  en: {
    title: "Terms of", accent: "use",
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
    email: "security@cvool.org",
  },
} as const;

export default function TermsPage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />
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
                <ul className="space-y-2">{s.items.map((item, j) => <li key={j} className="flex items-start gap-2 text-sm"><span className="text-accent shrink-0">→</span><span className="text-ink-700"><CvoolText text={item} /></span></li>)}</ul>
              ) : (
                <p className="text-sm text-ink-700 leading-relaxed"><CvoolText text={s.b!} /></p>
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
      <SubFooter lang={lang} />
    </div>
  );
}
