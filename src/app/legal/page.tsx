"use client";
import { useEffect } from "react";
import Link from "next/link";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";
import T from "@/content/legal.json";

function Card({ title, body }: { title?: string; body?: string }) {
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

function Sub({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-medium text-ink-900 mb-2">{title}</h3>
      {children}
    </section>
  );
}

export default function LegalPage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];

  // /security, /privacy, /terms redirect to /legal#hash; smooth-scroll on arrival.
  useEffect(() => {
    const el = document.getElementById(window.location.hash.slice(1));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />

      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500">{t.sub}</p>
      </section>

      <nav className="flex justify-center gap-3 text-xs">
        <a href="#security" className="text-accent hover:text-accent-dim transition">{t.nav.security}</a>
        <span className="text-ink-300">{' · '}</span>
        <a href="#privacy" className="text-accent hover:text-accent-dim transition">{t.nav.privacy}</a>
        <span className="text-ink-300">{' · '}</span>
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
        <Sub title={t.security.neverTitle}>
          <MarkedList items={t.security.never} mark={'✕'} color="text-red-500" />
        </Sub>
        <div className="bg-ink-050 rounded-lg p-5">
          <h3 className="text-sm font-medium text-ink-900 mb-1">{t.security.reportTitle}</h3>
          <p className="text-sm text-ink-500">{t.security.reportBody}</p>
        </div>
      </section>

      {/* PRIVACY */}
      <section id="privacy" className="space-y-4 scroll-mt-8 pt-4 border-t border-ink-100">
        <div className="relative text-center space-y-1">
          <Link href="/" className="absolute left-0 top-1 text-xs text-ink-400 hover:text-accent transition">{lang === "es" ? "← Inicio" : "← Home"}</Link>
          <h2 className="text-lg font-medium text-ink-900">{t.nav.privacy}</h2>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-base font-medium text-ink-900">{t.privacy.heading}</h3>
          <p className="text-sm text-ink-500">{t.privacy.sub}</p>
        </div>
        <Sub title={t.privacy.responsable[0]}>
          <div className="border border-ink-100 rounded-lg p-4">
            <p className="text-sm text-ink-700 leading-relaxed">{t.privacy.responsable[1]}</p>
          </div>
        </Sub>
        <Sub title={t.privacy.dataTitle}>
          <div className="space-y-2">
            {t.privacy.data.map(([title, body], i) => <Card key={i} title={title} body={body} />)}
          </div>
        </Sub>
        <Sub title={t.privacy.verifyCountersTitle}>
          <div className="border border-ink-100 rounded-lg p-4">
            <p className="text-sm text-ink-700 leading-relaxed mb-3">{t.privacy.verifyCountersBody}</p>
            <ul className="space-y-2">
              {t.privacy.verifyCounters.map(([label, url], i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-accent shrink-0">{'↗'}</span>
                  <span className="min-w-0">
                    <span className="text-ink-700 font-medium">{label}:</span>{" "}
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-dim transition break-all">{url}</a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Sub>
        <Sub title={t.privacy.purposeTitle}>
          <MarkedList items={t.privacy.purposes} mark={'→'} color="text-accent" />
        </Sub>
        <Sub title={t.privacy.neverTitle}>
          <MarkedList items={t.privacy.never} mark={'✕'} color="text-red-500" />
        </Sub>
        <Sub title={t.privacy.arcoTitle}>
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
        </Sub>
        <Sub title={t.privacy.intlTitle}>
          <div className="space-y-2">
            {t.privacy.intl.map(([flag, law, body], i) => (
              <div key={i} className="border border-ink-100 rounded-lg p-4 flex items-start gap-3">
                <span className="text-lg shrink-0">{flag}</span>
                <div>
                  <h4 className="text-sm font-medium text-ink-900 mb-0.5">{law}</h4>
                  <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-ink-500 mt-3">{t.privacy.intlNote}</p>
        </Sub>
      </section>

      {/* TERMS */}
      <section id="terms" className="space-y-4 scroll-mt-8 pt-4 border-t border-ink-100">
        <div className="relative text-center space-y-1">
          <Link href="/" className="absolute left-0 top-1 text-xs text-ink-400 hover:text-accent transition">{lang === "es" ? "← Inicio" : "← Home"}</Link>
          <h2 className="text-lg font-medium text-ink-900">{t.terms.heading}</h2>
          <p className="text-sm text-ink-500">{t.terms.sub}</p>
        </div>
        <p className="text-sm text-ink-500 leading-relaxed border border-ink-100 rounded-lg p-4">{t.terms.aiDisclaimer}</p>
        <div className="space-y-4">
          {t.terms.sections.map((s, i) => (
            <Sub key={i} title={s.t}>
              <div className="border border-ink-100 rounded-lg p-4">
                {s.items ? (
                  <ul className="space-y-2">
                    {s.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm">
                        <span className="text-accent shrink-0">{'→'}</span>
                        <span className="text-ink-700"><CvoolText text={item} /></span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-ink-700 leading-relaxed"><CvoolText text={s.b!} /></p>
                )}
              </div>
            </Sub>
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
