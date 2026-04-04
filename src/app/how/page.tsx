"use client";
import Link from "next/link";

const T = {
  es: {
    back: "← Inicio", title: "Cómo", accent: "funciona",
    sub: "cvool es open source (MIT). Aquí puedes ver exactamente qué pasa cuando subes tu CV.",
    pipeline: "El pipeline, paso a paso",
    steps: [
      { n: "01", t: "Subes tu CV", b: "Pegas texto o adjuntas un PDF en tu navegador. Si es PDF, se envía al backend donde Claude lo lee nativamente. Tu archivo nunca se guarda en disco." },
      { n: "02", t: "Sanitización de input", b: "El texto pasa por sanitizeInput() que elimina bytes nulos y caracteres de control. Se trunca a 35,000 caracteres máximo. Rate limiting: 7 peticiones/hora por IP." },
      { n: "03", t: "Prompt constitucional", b: "Tu CV se envía a Claude con un system prompt que incluye principios éticos explícitos: no discriminar, no inventar, no inflar scores. El prompt completo está en src/lib/prompts/analyze.txt \u2014 es auditable." },
      { n: "04", t: "Claude analiza y reescribe", b: "Un solo API call con temperature: 0 (determinístico). Claude devuelve JSON streamed via SSE con: score (0-100), análisis en 6 dimensiones, fortalezas, mejoras, y un CV completamente reescrito." },
      { n: "05", t: "Validación y render", b: "El backend parsea el JSON, valida que tenga score + analysis + improved_cv, y lo devuelve al frontend. Si Claude no responde JSON válido, se muestra un error honesto." },
      { n: "06", t: "Resultado en tu navegador", b: "Ves tu score, las 6 dimensiones, sugerencias con before/after, y tu CV mejorado listo para copiar. Todo en tu navegador. Nada se almacena." },
    ],
    stack: "Stack técnico",
    stackItems: [
      ["Frontend", "Next.js 16 + React 19 + Tailwind CSS 4"], ["Tipografía", "Geist + Geist Mono"],
      ["IA", "Claude Opus 4.6 (Anthropic SDK)"], ["Deploy", "Vercel (auto-deploy on push)"],
      ["Analytics", "Vercel Analytics (anónimo)"], ["Base de datos", "Ninguna. Cero. Nada."],
      ["Dependencias", "6 de producción, 0 librerías UI"], ["Licencia", "MIT"],
    ],
    principles: "Principios de diseño",
    princ: [
      ["Transparencia radical", "El código fuente está público. El prompt de IA está en el repo. Los pesos del scoring están documentados."],
      ["Anti-alucinación", "Cada sugerencia debe referenciar contenido real del CV. Si algo no está en tu CV, no se menciona."],
      ["Cero discriminación", "No penalizamos career gaps, caminos no lineales ni educación no tradicional."],
      ["Privacidad por diseño", "Sin base de datos, sin cuentas, sin cookies de tracking. Tu CV se descarta inmediatamente."],
    ],
    fork: "Fork, clona, contribuye",
    forkBody: "cvool es MIT. Puedes clonarlo, modificarlo, y lanzar tu propia versión. Solo necesitas una API key de Anthropic.",
    forkCode: "git clone https://github.com/pixan-ai/cvool.git\ncd cvool\nnpm install\necho \"ANTHROPIC_API_KEY=tu-key\" > .env.local\nnpm run dev",
    forkLink: "Ver repositorio en GitHub \u2192",
  },
  en: {
    back: "← Home", title: "How it", accent: "works",
    sub: "cvool is open source (MIT). Here\u2019s exactly what happens when you upload your resume.",
    pipeline: "The pipeline, step by step",
    steps: [
      { n: "01", t: "You upload your resume", b: "You paste text or attach a PDF. For PDFs, it\u2019s sent to the backend where Claude reads it natively. Your file is never saved to disk." },
      { n: "02", t: "Input sanitization", b: "The text goes through sanitizeInput() which strips null bytes and control characters. Truncated to 35,000 chars max. Rate limiting: 7 requests/hour per IP." },
      { n: "03", t: "Constitutional prompt", b: "Your resume is sent to Claude with a system prompt that includes explicit ethical principles: no discrimination, no fabrication, no inflated scores. The full prompt is in src/lib/prompts/analyze.txt." },
      { n: "04", t: "Claude analyzes and rewrites", b: "A single API call with temperature: 0. Claude returns JSON streamed via SSE with: score (0-100), 6-dimension analysis, strengths, improvements, and a completely rewritten resume." },
      { n: "05", t: "Validation and render", b: "The backend parses the JSON, validates score + analysis + improved_cv, and returns it. If Claude doesn\u2019t respond with valid JSON, an honest error is shown." },
      { n: "06", t: "Results in your browser", b: "You see your score, 6 dimensions, before/after suggestions, and your improved resume ready to copy. All in your browser. Nothing stored." },
    ],
    stack: "Tech stack",
    stackItems: [
      ["Frontend", "Next.js 16 + React 19 + Tailwind CSS 4"], ["Typography", "Geist + Geist Mono"],
      ["AI", "Claude Opus 4.6 (Anthropic SDK)"], ["Deploy", "Vercel (auto-deploy on push)"],
      ["Analytics", "Vercel Analytics (anonymous)"], ["Database", "None. Zero. Not one."],
      ["Dependencies", "6 production, 0 external UI libs"], ["License", "MIT"],
    ],
    principles: "Design principles",
    princ: [
      ["Radical transparency", "Source code is public. The AI prompt is in the repo. Scoring weights are documented."],
      ["Anti-hallucination", "Every suggestion must reference real CV content. If something isn\u2019t in your resume, it\u2019s not mentioned."],
      ["Zero discrimination", "We don\u2019t penalize career gaps, non-linear paths, or non-traditional education."],
      ["Privacy by design", "No database, no accounts, no tracking cookies. Your resume is discarded immediately."],
    ],
    fork: "Fork, clone, contribute",
    forkBody: "cvool is MIT licensed. Clone it, modify it, launch your own. You only need an Anthropic API key.",
    forkCode: "git clone https://github.com/pixan-ai/cvool.git\ncd cvool\nnpm install\necho \"ANTHROPIC_API_KEY=your-key\" > .env.local\nnpm run dev",
    forkLink: "View repository on GitHub \u2192",
  },
} as const;
type L = keyof typeof T;

export default function HowPage() {
  const lang: L = typeof window !== "undefined" && navigator.language.startsWith("en") ? "en" : "es";
  const t = T[lang];
  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-xs text-ink-400 hover:text-accent transition">{t.back}</Link>
        <span className="font-[family-name:var(--font-geist)] text-lg font-medium tracking-tight">
          <span className="text-ink-900">cv</span><span className="text-accent">ool</span>
        </span>
      </header>
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{t.title} <span className="text-accent">{t.accent}</span></h1>
        <p className="text-sm text-ink-500 max-w-lg mx-auto">{t.sub}</p>
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
        <p className="text-sm text-ink-500 mb-3">{t.forkBody}</p>
        <div className="border border-ink-100 rounded-lg p-4 bg-ink-050 mb-3">
          <pre className="text-xs font-[family-name:var(--font-mono)] text-ink-600 leading-relaxed overflow-x-auto">{t.forkCode}</pre>
        </div>
        <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:text-accent-dim transition font-medium">{t.forkLink}</a>
      </section>
      <p className="text-[11px] text-ink-300">Last updated: April 2026</p>
    </div>
  );
}
