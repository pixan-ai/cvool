"use client";
import Image from "next/image";
import { useState } from "react";
import { track } from "@vercel/analytics";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";
import { BuyMeACoffeeIcon } from "@/components/icons";
import T from "@/content/donate.json";

export default function DonatePage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];
  const [showBmcInfo, setShowBmcInfo] = useState(false);
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500 max-w-md mx-auto"><CvoolText text={t.sub} /></p>
      </section>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.whyTitle}</h2>
        <div className="border border-ink-100 rounded-lg divide-y divide-ink-100">
          {t.why.map(([title, body], i) => (
            <div key={i} className="p-4">
              <h3 className="text-sm font-medium text-ink-900 mb-0.5">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="border border-accent/20 rounded-lg p-6 text-center space-y-4">
        <p className="text-sm text-ink-700 font-medium mb-1">{t.ctaTitle}</p>
        <p className="text-sm text-ink-500 max-w-sm mx-auto"><CvoolText text={t.ctaSub} /></p>
        <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer"
          onClick={() => track("donation_clicked")}
          className="inline-flex items-center gap-2 bg-accent text-white text-sm font-medium px-6 py-3 rounded-lg hover:bg-accent-dim transition">
          <BuyMeACoffeeIcon />
          {t.ctaBtn}
        </a>
        <div>
          <button onClick={() => setShowBmcInfo(!showBmcInfo)}
            className="inline-flex items-center gap-1 text-xs text-ink-400 hover:text-ink-600 transition cursor-pointer border border-ink-100 rounded-full px-3 py-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {t.bmcPill}
          </button>
          {showBmcInfo && (
            <p className="text-xs text-ink-400 mt-2 max-w-sm mx-auto leading-relaxed donation-fade-in">{t.bmcExplain}</p>
          )}
        </div>
        <div className="pt-2">
          <Image src="/bmc-qr.png" alt="Buy Me a Coffee QR" width={140} height={140} className="mx-auto rounded-lg" />
          <p className="text-[11px] text-ink-300 mt-2">{t.qrLabel}</p>
        </div>
      </div>
      <section>
        <h2 className="text-sm font-medium text-ink-900 mb-3">{t.promiseTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-4">
          <ul className="space-y-2">{t.promises.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><span className="text-positive shrink-0">{'✓'}</span><span className="text-ink-700"><CvoolText text={p} /></span></li>)}</ul>
        </div>
      </section>
      <div className="bg-ink-050 rounded-lg p-5 text-center space-y-2">
        <p className="text-sm text-ink-900 font-bold">{t.bottomTitle}</p>
        <p className="text-sm text-ink-500"><CvoolText text={t.bottomBody} /></p>
        <p className="text-xs text-ink-400">{t.contactLabel} <a href={`mailto:${t.email}`} className="text-accent hover:text-accent-dim transition">{t.email}</a></p>
      </div>
      <SubFooter lang={lang} />
    </div>
  );
}
