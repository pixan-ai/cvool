"use client";
import { useState } from "react";
import Link from "next/link";

const T = {
  es: {
    back: "\u2190 Inicio",
    title: "C\u00f3mo", accent: "funciona",
    sub: "cvool es open source (MIT). Aqu\u00ed puedes ver exactamente qu\u00e9 pasa cuando subes tu CV.",
    pipelineTitle: "El pipeline, paso a paso",
    steps: [
      { n: "01", t: "Subes tu CV", b: "Pegas texto o adjuntas un PDF en tu navegador. Si es PDF, se env\u00eda al backend donde Claude lo lee nativamente (sin librer\u00edas de parsing). Tu archivo nunca se guarda en disco." },
      { n: "02", t: "Sanitizaci\u00f3n de input", b: "El texto pasa por sanitizeInput() que elimina bytes nulos y caracteres de control. Se trunca a 35,000 caracteres m\u00e1ximo. Rate limiting: 7 peticiones/hora por IP." },
      { n: "03", t: "Prompt constitucional", b: "Tu CV se env\u00eda a la API de Claude con un system prompt que incluye principios \u00e9ticos expl\u00edcitos: no discriminar, no inventar, no inflar scores, referenciar solo contenido real del CV. El prompt est\u00e1 en src/lib/prompts/analyze.txt \u2014 es auditable." },
      { n: "04", t: "Claude analiza y reescribe", b: "Un solo API call con temperature: 0 (determin\u00edstico). Claude devuelve JSON streamed v\u00eda SSE con: score (0-100), an\u00e1lisis en 6 dimensiones con evidencia, fortalezas, mejoras, y un CV completamente reescrito." },
      { n: "05", t: "Validaci\u00f3n y render", b: "El backend parsea el JSON, valida que tenga score + analysis + improved_cv, y lo devuelve al frontend. Si Claude no responde JSON v\u00e1lido, se muestra un error honesto \u2014 nunca resultados inventados." },
      { n: "06", t: "Resultado en tu navegador", b: "Ves tu score, las 6 dimensiones, sugerencias con before/after, y tu CV mejorado listo para copiar. Todo en tu navegador. Nada se almacena." },
    ],
    stackTitle: "Stack t\u00e9cnico",
    stack: [
      ["Frontend", "Next.js 16 + React 19 + Tailwind CSS 4"],
      ["Tipograf\u00eda", "Geist + Geist Mono"],
      ["IA", "Claude Opus 4.6 (Anthropic SDK, streaming SSE)"],
      ["Deploy", "Vercel (auto-deploy on push)"],
      ["Base de datos", "Ninguna. Cero. Nada."],
      ["Dependencias", "6 deps de producci\u00f3n, 0 librer\u00edas UI externas"],
      ["Licencia", "MIT"],
    ],
    principlesTitle: "Principios de dise\u00f1o",
    principles: [
      ["Transparencia radical", "El c\u00f3digo fuente est\u00e1 p\u00fablico. El prompt de IA est\u00e1 en el repo. Los pesos del scoring est\u00e1n documentados."],
      ["Anti-alucinaci\u00f3n", "Cada sugerencia debe referenciar contenido real del CV. Consejo gen\u00e9rico = falla del sistema."],
      ["Cero discriminaci\u00f3n", "No penalizamos career gaps, caminos no lineales ni educaci\u00f3n no tradicional."],
      ["Privacidad por dise\u00f1o", "Sin base de datos, sin cuentas, sin cookies de tracking. Tu CV se descarta inmediatamente."],
    ],
    forkTitle: "Fork, clona, contribuye",
    forkBody: "cvool es MIT. Puedes clonarlo, modificarlo, y lanzar tu propia versi\u00f3n.",
    forkCode: "git clone https://github.com/pixan-ai/cvool.git\ncd cvool\nnpm install\necho \"ANTHROPIC_API_KEY=tu-key\" > .env.local\nnpm run dev",
    forkLink: "Ver repositorio en GitHub \u2192",
  },
  en: {
    back: "\u2190 Home",
    title: "How it", accent: "works",
    sub: "cvool is open source (MIT). Here\u2019s exactly what happens when you upload your resume.",
    pipelineTitle: "The pipeline, step by step",
    steps: [
      { n: "01", t: "You upload your resume", b: "You paste text or attach a PDF in your browser. For PDFs, it\u2019s sent to the backend where Claude reads it natively (no parsing libraries). Your file is never saved to disk." },
      { n: "02", t: "Input sanitization", b: "The text goes through sanitizeInput() which strips null bytes and control characters. It\u2019s truncated to 35,000 characters max. Rate limiting: 7 requests/hour per IP." },
      { n: "03", t: "Constitutional prompt", b: "Your resume is sent to Claude\u2019s API with a system prompt that includes explicit ethical principles: no discrimination, no fabrication, no inflated scores. The prompt is in src/lib/prompts/analyze.txt \u2014 it\u2019s auditable." },
      { n: "04", t: "Claude analyzes and rewrites", b: "A single API call with temperature: 0 (deterministic). Claude returns JSON streamed via SSE with: score (0-100), analysis across 6 dimensions with evidence, and a completely rewritten resume." },
      { n: "05", t: "Validation and render", b: "The backend parses the JSON, validates it has score + analysis + improved_cv, and returns it. If Claude doesn\u2019t respond with valid JSON, an honest error is shown \u2014 never fabricated results." },
      { n: "06", t: "Results in your browser", b: "You see your score, the 6 dimensions, suggestions with before/after, and your improved resume ready to copy. All in your browser. Nothing is stored." },
    ],
    stackTitle: "Tech stack",
    stack: [
      ["Frontend", "Next.js 16 + React 19 + Tailwind CSS 4"],
      ["Typography", "Geist + Geist Mono"],
      ["AI", "Claude Opus 4.6 (Anthropic SDK, streaming SSE)"],
      ["Deploy", "Vercel (auto-deploy on push)"],
      ["Database", "None. Zero. Not one."],
      ["Dependencies", "6 production deps, 0 external UI libraries"],
      ["License", "MIT"],
    ],
    principlesTitle: "Design principles",
    principles: [
      ["Radical transparency", "Source code is public. The AI prompt is in the repo. Scoring weights are documented."],
      ["Anti-hallucination", "Every suggestion must reference real CV content. Generic advice = system failure."],
      ["Zero discrimination", "We don\u2019t penalize career gaps, non-linear paths, or non-traditional education."],
      ["Privacy by design", "No database, no accounts, no tracking cookies. Your resume is discarded immediately."],
    ],
    forkTitle: "Fork, clone, contribute",
    forkBody: "cvool is MIT licensed. You can clone it, modify it, and launch your own version.",
    forkCode: "git clone https://github.com/pixan-ai/cvool.git\ncd cvool\nnpm install\necho \"ANTHROPIC_API_KEY=your-key\" > .env.local\nnpm run dev",
    forkLink: "View repository on GitHub \u2192",
  },
} as const;

export default function HowPage() {
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
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.pipelineTitle}</h2>
        <div className="space-y-3">
          {t.steps.map((s, i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-5">
              <div className="flex items-start gap-4">
                <span className="font-[family-name:var(--font-mono)] text-xs text-accent font-medium mt-0.5 shrink-0">{s.n}</span>
                <div><h3 className="text-sm font-medium text-ink-900 mb-1">{s.t}</h3><p className="text-sm text-ink-500 leading-relaxed">{s.b}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.stackTitle}</h2>
        <div className="border border-ink-100 rounded-lg p-5 space-y-2.5">
          {t.stack.map(([l, v], i) => (
            <div key={i} className="flex items-baseline gap-3 text-sm">
              <span className="text-ink-400 font-[family-name:var(--font-mono)] text-xs shrink-0 w-24">{l}</span>
              <span className="text-ink-700">{v}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-4">{t.principlesTitle}</h2>
        <div className="space-y-3">
          {t.principles.map(([title, body], i) => (
            <div key={i} className="border border-ink-100 rounded-lg p-5">
              <h3 className="text-sm font-medium text-ink-900 mb-1">{title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-lg font-medium text-ink-900 mb-3">{t.forkTitle}</h2>
        <p className="text-sm text-ink-500 leading-relaxed mb-4">{t.forkBody}</p>
        <div className="border border-ink-100 rounded-lg p-5 bg-ink-050 mb-4">
          <pre className="text-xs font-[family-name:var(--font-mono)] text-ink-600 leading-relaxed overflow-x-auto">{t.forkCode}</pre>
        </div>
        <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.forkLink}</a>
      </section>
    </main>
  );
}
