"use client";
import Image from "next/image";
import { SubHeader, SubFooter, useSubLang } from "@/components/SubLayout";
import { CvoolText } from "@/components/CvoolBrand";
import T from "@/content/about.json";

function RichText({ text }: { text: string }) {
  return (
    <p className="text-sm text-ink-700 leading-relaxed">
      <CvoolText text={text} />
    </p>
  );
}

export default function AboutPage() {
  const [lang, setLang] = useSubLang();
  const t = T[lang];
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <SubHeader lang={lang} setLang={setLang} />
      <section className="text-center space-y-1">
        <p className="text-xs text-ink-300 line-through">{t.strike}</p>
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
      </section>
      <div className="space-y-5">
        {t.blocks.map((b, i) => <RichText key={i} text={b} />)}
      </div>
      <div className="flex items-center gap-3">
        <Image src="/founder.jpg" alt="Founder" width={40} height={40} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm text-ink-700 font-medium">— {t.sig}</p>
          <p className="text-xs text-ink-400">{t.loc}</p>
          <a href={`mailto:${t.contact}`} className="text-xs text-accent hover:text-accent-dim transition">{t.contact}</a>
        </div>
      </div>
      <SubFooter lang={lang} />
    </div>
  );
}
