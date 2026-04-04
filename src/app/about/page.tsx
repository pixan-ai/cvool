"use client";
import { useState } from "react";
import Link from "next/link";

const T = {
  es: {
    back: "\u2190 Inicio",
    strike: "\u00bfQui\u00e9nes somos?",
    title: "\u00bfQui\u00e9n", accent: "soy?",
    blocks: [
      "Este es un proyecto de una persona con muchas horas de vuelo en tecnolog\u00eda y muchos a\u00f1os analizando cientos de CVs y entrevistando candidatos de m\u00faltiples perfiles e industrias. Constru\u00ed cvool con una convicci\u00f3n simple: el acceso a un trabajo digno es un derecho humano reconocido globalmente, y las mejores herramientas deber\u00edan estar al alcance de todos.",
      "Alguien necesitaba un buen analizador de CV en espa\u00f1ol. No exist\u00eda. As\u00ed que lo construimos. Y \u00bfpor qu\u00e9 no?, tambi\u00e9n para cualquier idioma. Y despu\u00e9s, buscamos optimizar ese CV a su m\u00e1xima expresi\u00f3n con IA generativa de frontera (gracias, Anthropic!). Buscamos ayudar a cualquier persona a encontrar ese trabajo que te cambia la vida.",
      "Esto no es un startup buscando la siguiente ronda de inversi\u00f3n. Es un caf\u00e9 en la mano, una ThinkPad X1 hermosa, una API key de Anthropic, y la terquedad suficiente para hacer que funcione. El c\u00f3digo es open source / MIT. La optimizaci\u00f3n es sin costo y an\u00f3nima. Los datos se evaporan de inmediato.",
      "Si te sirve para conseguir ese trabajo que est\u00e1s buscando, ya vali\u00f3 toda la desvelada. Y si logras obtener ese trabajo que te cambi\u00f3 la vida, se vale regresar y donar para tokens, stack y crecimiento. cvool siempre ser\u00e1 gratis, an\u00f3nimo, honesto y transparente.",
    ],
    sig: "Alfredo Arenas", loc: "Ciudad de M\u00e9xico",
  },
  en: {
    back: "\u2190 Home",
    strike: "About us",
    title: "About", accent: "me",
    blocks: [
      "This is a one-person project with many flight hours in technology and many years reviewing hundreds of resumes and interviewing candidates across multiple roles and industries. I built cvool with a simple conviction: access to dignified work is a globally recognized human right, and the best tools should be available to everyone.",
      "Someone needed a good resume analyzer in Spanish. It didn\u2019t exist. So we built it. And why not make it work in any language too? And then, we set out to optimize any resume to its fullest potential with frontier generative AI (thanks, Anthropic!). We\u2019re here to help anyone find the job that changes their life.",
      "This isn\u2019t a startup chasing the next funding round. It\u2019s a cup of coffee, a beautiful ThinkPad X1, an Anthropic API key, and enough stubbornness to make it work. The code is open source / MIT. The optimization is free and anonymous. Your data evaporates immediately.",
      "If this helps you land the job you\u2019re looking for, every late night was worth it. And if you do land the job that changed your life, feel free to come back and donate for tokens, stack, and growth. cvool will always be free, anonymous, honest, and transparent.",
    ],
    sig: "Alfredo Arenas", loc: "Mexico City",
  },
} as const;

export default function AboutPage() {
  const [lang, setLang] = useState<"es"|"en">("es");
  const t = T[lang];
  return (
    <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xs text-ink-400 hover:text-accent transition">{t.back}</Link>
        <button onClick={() => setLang(lang === "es" ? "en" : "es")} className="text-xs font-medium text-ink-500 border border-ink-100 rounded-lg px-2 py-1 hover:border-accent cursor-pointer">{lang.toUpperCase()}</button>
      </div>
      <section className="text-center">
        <p className="text-sm text-ink-300 line-through mb-2">{t.strike}</p>
        <h1 className="text-3xl font-light tracking-tight text-ink-900">{t.title} <span className="text-accent">{t.accent}</span></h1>
      </section>
      <div className="space-y-6">
        {t.blocks.map((b, i) => <p key={i} className="text-sm text-ink-700 leading-relaxed">{b}</p>)}
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center text-ink-400 text-lg font-medium">AA</div>
        <div><p className="text-sm text-ink-700 font-medium">\u2014 {t.sig}</p><p className="text-xs text-ink-400">{t.loc}</p></div>
      </div>
    </main>
  );
}
