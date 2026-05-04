"use client";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";
import T from "@/content/how.json";

export default function HowPage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500 max-w-lg mx-auto"><CvoolText text={t.sub} /></p>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.pipeline}</h2>
        <div className="space-y-2">
          {t.steps.map((s, i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="font-[family-name:var(--font-mono)] text-xs text-accent font-medium mt-0.5 shrink-0">{s.n}</span>
                <div><h3 className="text-sm font-medium text-ink-900 mb-0.5">{s.t}</h3><p className="text-sm text-ink-500 leading-relaxed">{s.b}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.stack}</h2>
        <div className="border border-ink-100 rounded-lg p-4 space-y-2">
          {t.stackItems.map(([l, v], i) => (
            <div key={i} className="flex items-baseline gap-3 text-sm">
              <span className="text-ink-400 font-[family-name:var(--font-mono)] text-xs shrink-0 w-24">{l}</span>
              <span className="text-ink-700">{v}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.principles}</h2>
        <div className="space-y-2">
          {t.princ.map(([title, body], i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-4">
              <h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-2">{t.fork}</h2>
        <p className="text-sm text-ink-500 mb-3"><CvoolText text={t.forkBody} /></p>
        <div className="border border-ink-100 rounded-lg p-4 bg-ink-050 mb-3">
          <pre className="text-xs font-[family-name:var(--font-mono)] text-ink-600 leading-relaxed overflow-x-auto">{t.forkCode}</pre>
        </div>
        <div className="flex items-center justify-between">
          <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.forkLink}</a>
          <span className="text-xs text-ink-400">{t.contactLabel} <a href={`mailto:${t.email}`} className="text-accent hover:text-accent-dim transition">{t.email}</a></span>
        </div>
      </section>
      <SubFooter lang={lang} />
    </div>
  );
}
