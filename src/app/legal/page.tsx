"use client";
import { useEffect } from "react";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";

// Unified legal page — replaces the previous /security, /privacy, /terms
// triad. Each former page becomes an anchored section here, with redirects
// in next.config.ts pointing the old URLs to #security / #privacy / #terms.
//
// Copy is preserved verbatim from the previous three pages so nothing was
// lost in the consolidation; only the chrome (header, footer, contact card,
// language disclaimer) was deduped from 3x to 1x.
const T = {
  es: {
    title: "Informaci\u00f3n", accent: "legal",
    sub: "Seguridad, privacidad y t\u00e9rminos en una sola p\u00e1gina.",
    nav: { security: "Seguridad", privacy: "Privacidad", terms: "T\u00e9rminos" },
    security: {
      heading: "Seguridad",
      sub: "Tu CV es tuyo. As\u00ed es como lo protegemos.",
      sections: [
        ["Sin base de datos", "No almacenamos CVs, resultados, ni datos personales. Tu CV existe solo en memoria durante el an\u00e1lisis y se descarta inmediatamente."],
        ["Sin cuentas", "No hay registro, login, ni cookies de sesi\u00f3n. Nada que hackear porque no hay nada que almacenar."],
        ["TLS/SSL", "Todas las comunicaciones est\u00e1n cifradas en tr\u00e1nsito con TLS 1.3."],
        ["Headers de seguridad", "HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy."],
        ["Sanitizaci\u00f3n de input", "Bytes nulos, caracteres de control, y contenido excesivo se eliminan antes de procesar."],
        ["Rate limiting", "7 peticiones por hora por IP. Sin base de datos \u2014 en memoria."],
        ["API key protegida", "La clave de Anthropic es server-side. Nunca se expone al cliente."],
        ["Open source", "Todo el c\u00f3digo es auditable en GitHub."],
      ] as ReadonlyArray<readonly [string, string]>,
      neverTitle: "Lo que NUNCA hacemos",
      never: ["Almacenar tu CV o datos personales", "Compartir datos con terceros para marketing", "Usar cookies de tracking o fingerprinting", "Crear perfiles de usuario", "Vender o monetizar tus datos"],
      reportTitle: "Reportar vulnerabilidades",
      reportBody: "Si descubres una vulnerabilidad, rep\u00f3rtala responsablemente a security@cvool.org",
    },
    privacy: {
      heading: "Aviso de privacidad",
      sub: "C\u00f3mo tratamos tus datos (spoiler: no los guardamos).",
      responsable: ["Responsable", "cvool.org es operado por Alfredo Arenas (Pixan.ai) desde Ciudad de M\u00e9xico, M\u00e9xico. Contacto: security@cvool.org"] as readonly [string, string],
      dataTitle: "Datos que recopilamos",
      data: [
        ["Tu CV (temporal)", "Se procesa en memoria durante el an\u00e1lisis y se descarta inmediatamente. Nunca se almacena en disco ni base de datos."],
        ["Direcci\u00f3n IP (temporal)", "Se usa \u00fanicamente para rate limiting (7 req/hora). Se almacena en memoria vol\u00e1til del servidor y se pierde con cada reinicio."],
        ["Analytics agregados", "Vercel Analytics recopila datos an\u00f3nimos y agregados (pa\u00eds, dispositivo, p\u00e1ginas vistas). Sin cookies, sin identificadores personales."],
        ["Contadores p\u00fablicos v\u00eda abacus.jasoncameron.dev", "Cuando completas un an\u00e1lisis, tu navegador (no nuestro servidor) env\u00eda una llamada a abacus.jasoncameron.dev \u2014 un contador open source, sin base de datos \u2014 para incrementar el contador p\u00fablico de CVs mejorados. Esto significa que ese tercero ve tu IP. Si prefieres evitarlo, un adblocker bloquea la llamada sin afectar tu an\u00e1lisis."],
      ] as ReadonlyArray<readonly [string, string]>,
      purposeTitle: "Finalidades",
      purposes: ["Analizar y mejorar tu CV con IA", "Prevenir abuso del servicio (rate limiting)", "Mejorar el producto con analytics an\u00f3nimos"],
      neverTitle: "Lo que NUNCA hacemos",
      never: ["Almacenar tu CV o resultados", "Crear perfiles de usuario", "Compartir datos con terceros para marketing", "Usar cookies de tracking", "Vender o monetizar tus datos"],
      arcoTitle: "Derechos ARCO (M\u00e9xico)",
      arcoBody: "Bajo la LFPDPPP tienes derecho a:",
      arco: [["A", "Acceso", "Conocer qu\u00e9 datos tenemos"], ["R", "Rectificaci\u00f3n", "Corregir datos inexactos"], ["C", "Cancelaci\u00f3n", "Solicitar eliminaci\u00f3n"], ["O", "Oposici\u00f3n", "Oponerte al tratamiento"]] as ReadonlyArray<readonly [string, string, string]>,
      arcoNote: "Como no almacenamos datos personales, estos derechos se cumplen por dise\u00f1o.",
      intlTitle: "Cumplimiento internacional",
      intl: [
        ["\ud83c\uddea\ud83c\uddfa", "GDPR (UE)", "Derecho al olvido, portabilidad, minimizaci\u00f3n. Cumplido por dise\u00f1o: no hay datos que borrar."],
        ["\ud83c\udde7\ud83c\uddf7", "LGPD (Brasil)", "Consentimiento, acceso, eliminaci\u00f3n. Cumplido: no almacenamos datos."],
        ["\ud83c\uddfa\ud83c\uddf8", "CCPA (California)", "Derecho a saber, eliminar, opt-out de venta. No vendemos datos."],
        ["\ud83c\udde8\ud83c\udde6", "PIPEDA (Canad\u00e1)", "Consentimiento, acceso, precisi\u00f3n. Cumplido por dise\u00f1o."],
      ] as ReadonlyArray<readonly [string, string, string]>,
      intlNote: "El mismo principio aplica en todas las jurisdicciones: no almacenamos tus datos.",
    },
    terms: {
      heading: "T\u00e9rminos de uso",
      sub: "Condiciones para usar cvool.org.",
      sections: [
        { t: "Aceptaci\u00f3n", b: "Al usar cvool.org aceptas estos t\u00e9rminos. Si no est\u00e1s de acuerdo, no uses el servicio.", items: null as readonly string[] | null },
        { t: "Servicio", b: null as string | null, items: ["cvool analiza y mejora CVs usando inteligencia artificial (Claude, Anthropic)", "El servicio es gratuito y sin registro", "Los resultados son sugerencias generadas por IA, no asesor\u00eda profesional", "No garantizamos que los resultados te consigan un empleo"] as readonly string[] | null },
        { t: "Uso aceptable", b: null as string | null, items: ["Usa cvool para analizar y mejorar tu propio CV", "No env\u00edes contenido il\u00edcito, ofensivo o que viole derechos de terceros", "No intentes evadir el rate limiting ni abusar del servicio", "No uses bots, scrapers, ni automatizaci\u00f3n no autorizada"] as readonly string[] | null },
        { t: "Propiedad intelectual", b: "Tu CV es tuyo. Los resultados generados son tuyos. El c\u00f3digo de cvool es open source (MIT). El prompt de IA es parte del c\u00f3digo p\u00fablico.", items: null as readonly string[] | null },
        { t: "Privacidad", b: "No almacenamos tu CV ni datos personales. Consulta la secci\u00f3n de privacidad arriba para m\u00e1s detalles.", items: null as readonly string[] | null },
        { t: "Limitaci\u00f3n de responsabilidad", b: "cvool se ofrece \"tal cual\" sin garant\u00edas. No somos responsables por decisiones tomadas con base en los resultados del an\u00e1lisis.", items: null as readonly string[] | null },
        { t: "Modificaciones", b: "Podemos actualizar estos t\u00e9rminos. Los cambios se publican en esta p\u00e1gina con fecha actualizada.", items: null as readonly string[] | null },
        { t: "Ley aplicable", b: "Estos t\u00e9rminos se rigen por las leyes de M\u00e9xico. Cualquier disputa se resolver\u00e1 en los tribunales de la Ciudad de M\u00e9xico.", items: null as readonly string[] | null },
      ],
    },
    contactTitle: "Contacto", contactBody: "Para cualquier consulta sobre seguridad, privacidad o t\u00e9rminos:",
    email: "security@cvool.org",
    langDisclaimer: "Esta p\u00e1gina est\u00e1 disponible solo en espa\u00f1ol e ingl\u00e9s. Para usuarios en otros idiomas, la versi\u00f3n en ingl\u00e9s es la de referencia.",
    lastUpdated: "\u00daltima actualizaci\u00f3n: abril 2026",
  },
  en: {
    title: "Legal", accent: "information",
    sub: "Security, privacy, and terms on a single page.",
    nav: { security: "Security", privacy: "Privacy", terms: "Terms" },
    security: {
      heading: "Security",
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
      ] as ReadonlyArray<readonly [string, string]>,
      neverTitle: "What we NEVER do",
      never: ["Store your resume or personal data", "Share data with third parties for marketing", "Use tracking cookies or fingerprinting", "Create user profiles", "Sell or monetize your data"],
      reportTitle: "Report vulnerabilities",
      reportBody: "If you discover a vulnerability, please report it responsibly to security@cvool.org",
    },
    privacy: {
      heading: "Privacy notice",
      sub: "How we handle your data (spoiler: we don\u2019t store it).",
      responsable: ["Data controller", "cvool.org is operated by Alfredo Arenas (Pixan.ai) from Mexico City, Mexico. Contact: security@cvool.org"] as readonly [string, string],
      dataTitle: "Data we collect",
      data: [
        ["Your resume (temporary)", "Processed in memory during analysis and discarded immediately. Never stored on disk or database."],
        ["IP address (temporary)", "Used only for rate limiting (7 req/hour). Stored in volatile server memory, lost on restart."],
        ["Aggregate analytics", "Vercel Analytics collects anonymous, aggregate data (country, device, page views). No cookies, no personal identifiers."],
        ["Public counters via abacus.jasoncameron.dev", "When you complete an analysis, your browser (not our server) sends a request to abacus.jasoncameron.dev \u2014 an open-source counter with no database \u2014 to increment the public CVs-improved counter. This means that third party sees your IP. If you\u2019d rather not, an adblocker blocks the call without affecting your analysis."],
      ] as ReadonlyArray<readonly [string, string]>,
      purposeTitle: "Purposes",
      purposes: ["Analyze and improve your resume with AI", "Prevent service abuse (rate limiting)", "Improve the product with anonymous analytics"],
      neverTitle: "What we NEVER do",
      never: ["Store your resume or results", "Create user profiles", "Share data with third parties for marketing", "Use tracking cookies", "Sell or monetize your data"],
      arcoTitle: "ARCO Rights (Mexico)",
      arcoBody: "Under LFPDPPP you have the right to:",
      arco: [["A", "Access", "Know what data we have"], ["R", "Rectification", "Correct inaccurate data"], ["C", "Cancellation", "Request deletion"], ["O", "Opposition", "Object to processing"]] as ReadonlyArray<readonly [string, string, string]>,
      arcoNote: "Since we don\u2019t store personal data, these rights are fulfilled by design.",
      intlTitle: "International compliance",
      intl: [
        ["\ud83c\uddea\ud83c\uddfa", "GDPR (EU)", "Right to erasure, portability, minimization. Fulfilled by design: no data to erase."],
        ["\ud83c\udde7\ud83c\uddf7", "LGPD (Brazil)", "Consent, access, deletion. Fulfilled: we don\u2019t store data."],
        ["\ud83c\uddfa\ud83c\uddf8", "CCPA (California)", "Right to know, delete, opt-out of sale. We don\u2019t sell data."],
        ["\ud83c\udde8\ud83c\udde6", "PIPEDA (Canada)", "Consent, access, accuracy. Fulfilled by design."],
      ] as ReadonlyArray<readonly [string, string, string]>,
      intlNote: "The same principle applies across all jurisdictions: we don\u2019t store your data.",
    },
    terms: {
      heading: "Terms of use",
      sub: "Conditions for using cvool.org.",
      sections: [
        { t: "Acceptance", b: "By using cvool.org you accept these terms. If you disagree, don\u2019t use the service.", items: null as readonly string[] | null },
        { t: "Service", b: null as string | null, items: ["cvool analyzes and improves resumes using AI (Claude, Anthropic)", "The service is free and requires no registration", "Results are AI-generated suggestions, not professional advice", "We don\u2019t guarantee results will get you a job"] as readonly string[] | null },
        { t: "Acceptable use", b: null as string | null, items: ["Use cvool to analyze and improve your own resume", "Don\u2019t submit illegal, offensive, or rights-violating content", "Don\u2019t attempt to bypass rate limiting or abuse the service", "Don\u2019t use bots, scrapers, or unauthorized automation"] as readonly string[] | null },
        { t: "Intellectual property", b: "Your resume is yours. Generated results are yours. cvool\u2019s code is open source (MIT). The AI prompt is part of the public code.", items: null as readonly string[] | null },
        { t: "Privacy", b: "We don\u2019t store your resume or personal data. See the privacy section above for details.", items: null as readonly string[] | null },
        { t: "Limitation of liability", b: "cvool is provided \"as is\" without warranties. We\u2019re not liable for decisions made based on analysis results.", items: null as readonly string[] | null },
        { t: "Modifications", b: "We may update these terms. Changes are posted on this page with an updated date.", items: null as readonly string[] | null },
        { t: "Governing law", b: "These terms are governed by the laws of Mexico. Any disputes will be resolved in Mexico City courts.", items: null as readonly string[] | null },
      ],
    },
    contactTitle: "Contact", contactBody: "For any inquiries regarding security, privacy, or terms:",
    email: "security@cvool.org",
    langDisclaimer: "This page is available in English and Spanish only. For users in other languages, the English version is the reference.",
    lastUpdated: "Last updated: April 2026",
  },
} as const;

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-ink-100 rounded-lg p-4">
      <h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3>
      <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
    </div>
  );
}

function MarkedList({ items, mark, color }: { items: readonly string[]; mark: string; color: string }) {
  return (
    <div className="border border-ink-100 rounded-lg p-4">
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`shrink-0 ${color}`}>{mark}</span>
            <span className="text-ink-700"><CvoolText text={item} /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LegalPage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];

  // Auto-scroll to anchor when arriving from /security, /privacy, or /terms
  // (the redirect in next.config.ts preserves the hash). Also handles direct
  // links like /legal#privacy from external sources.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (["security", "privacy", "terms"].includes(hash)) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />

      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500">{t.sub}</p>
      </section>

      {/* Quick anchor nav */}
      <nav className="flex justify-center gap-3 text-xs">
        <a href="#security" className="text-accent hover:text-accent-dim transition">{t.nav.security}</a>
        <span className="text-ink-300">·</span>
        <a href="#privacy" className="text-accent hover:text-accent-dim transition">{t.nav.privacy}</a>
        <span className="text-ink-300">·</span>
        <a href="#terms" className="text-accent hover:text-accent-dim transition">{t.nav.terms}</a>
      </nav>

      {/* SECURITY */}
      <section id="security" className="space-y-4 scroll-mt-8">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-medium text-ink-900">{t.security.heading}</h2>
          <p className="text-sm text-ink-500">{t.security.sub}</p>
        </div>
        <div className="space-y-2">
          {t.security.sections.map(([title, body], i) => <Card key={i} title={title} body={body} />)}
        </div>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.security.neverTitle}</h3>
          <MarkedList items={t.security.never} mark="✕" color="text-red-500" />
        </section>
        <div className="bg-ink-050 rounded-lg p-5">
          <h3 className="text-sm font-medium text-ink-900 mb-1">{t.security.reportTitle}</h3>
          <p className="text-sm text-ink-500">{t.security.reportBody}</p>
        </div>
      </section>

      {/* PRIVACY */}
      <section id="privacy" className="space-y-4 scroll-mt-8 pt-4 border-t border-ink-100">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-medium text-ink-900">{t.privacy.heading}</h2>
          <p className="text-sm text-ink-500">{t.privacy.sub}</p>
        </div>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.privacy.responsable[0]}</h3>
          <div className="border border-ink-100 rounded-lg p-4">
            <p className="text-sm text-ink-700 leading-relaxed">{t.privacy.responsable[1]}</p>
          </div>
        </section>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.privacy.dataTitle}</h3>
          <div className="space-y-2">
            {t.privacy.data.map(([title, body], i) => <Card key={i} title={title} body={body} />)}
          </div>
        </section>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.privacy.purposeTitle}</h3>
          <MarkedList items={t.privacy.purposes} mark="→" color="text-accent" />
        </section>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.privacy.neverTitle}</h3>
          <MarkedList items={t.privacy.never} mark="✕" color="text-red-500" />
        </section>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.privacy.arcoTitle}</h3>
          <div className="border border-ink-100 rounded-lg p-4">
            <p className="text-sm text-ink-700 mb-3">{t.privacy.arcoBody}</p>
            <ul className="space-y-2">
              {t.privacy.arco.map(([letter, name, desc], i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-accent font-medium shrink-0">{letter}</span>
                  <span className="text-ink-700"><strong className="text-ink-900">{name}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-ink-500 mt-3">{t.privacy.arcoNote}</p>
          </div>
        </section>
        <section>
          <h3 className="text-sm font-medium text-ink-900 mb-2">{t.privacy.intlTitle}</h3>
          <div className="space-y-2">
            {t.privacy.intl.map(([flag, law, body], i) => (
              <div key={i} className="border border-ink-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{flag}</span>
                  <div>
                    <h4 className="text-sm font-medium text-ink-900 mb-0.5">{law}</h4>
                    <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-500 mt-3">{t.privacy.intlNote}</p>
        </section>
      </section>

      {/* TERMS */}
      <section id="terms" className="space-y-4 scroll-mt-8 pt-4 border-t border-ink-100">
        <div className="text-center space-y-1">
          <h2 className="text-lg font-medium text-ink-900">{t.terms.heading}</h2>
          <p className="text-sm text-ink-500">{t.terms.sub}</p>
        </div>
        <div className="space-y-4">
          {t.terms.sections.map((s, i) => (
            <section key={i}>
              <h3 className="text-sm font-medium text-ink-900 mb-2">{s.t}</h3>
              <div className="border border-ink-100 rounded-lg p-4">
                {s.items ? (
                  <ul className="space-y-2">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-accent shrink-0">→</span>
                        <span className="text-ink-700"><CvoolText text={item} /></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-700 leading-relaxed"><CvoolText text={s.b!} /></p>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>

      {/* SHARED CONTACT (was duplicated 3x in the old pages) */}
      <div className="bg-ink-050 rounded-lg p-5">
        <h2 className="text-sm font-medium text-ink-900 mb-1">{t.contactTitle}</h2>
        <p className="text-sm text-ink-500 mb-2">{t.contactBody}</p>
        <a href={`mailto:${t.email}`} className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.email}</a>
      </div>

      <p className="text-[11px] text-ink-300 leading-relaxed">{t.langDisclaimer}</p>
      <p className="text-[11px] text-ink-300">{t.lastUpdated}</p>

      <SubFooter lang={lang} />
    </div>
  );
}
