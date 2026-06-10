"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

/* ---------------------------------------------------------------------------
   TechMap — the in-depth technical schematic of how cvool works, rendered
   below the "How it works" page. Bilingual (es/en). Code identifiers stay in
   English (they're code); only human prose is translated.
--------------------------------------------------------------------------- */
const PIPELINE = ["you", "page", "api", "claude", "result"] as const;

const STACK = [
  { name: "Next.js 15", id: "next" },
  { name: "React 19", id: "react" },
  { name: "Tailwind 4", id: "tw" },
  { name: "@anthropic-ai/sdk", id: "sdk" },
  { name: "Claude Sonnet 4.6", id: "claude" },
  { name: "Server-Sent Events", id: "sse" },
  { name: "partial-json", id: "pjson" },
  { name: "@vercel/analytics", id: "analytics" },
  { name: "Vercel", id: "vercel" },
] as const;

const TREE = [
  {
    id: "app",
    dir: "app/",
    items: [
      { p: "page.tsx", id: "page" },
      { p: "layout.tsx", id: "layout" },
      { p: "globals.css", id: "css" },
      { p: "api/analyze/route.ts", id: "analyze" },
      { p: "api/parse/route.ts", id: "parse" },
    ],
  },
  {
    id: "lib",
    dir: "lib/",
    items: [
      { p: "streamParse.ts", id: "stream" },
      { p: "cors.ts", id: "cors" },
      { p: "rate-limit.ts", id: "rate" },
      { p: "i18n.ts", id: "i18n" },
      { p: "prompts/analyze.txt", id: "prompt" },
    ],
  },
  {
    id: "components",
    dir: "components/",
    items: [
      { p: "SubLayout.tsx", id: "sublayout" },
      { p: "PublicCounters.tsx", id: "counters" },
      { p: "CvoolBrand.tsx · icons.tsx", id: "brand" },
    ],
  },
  {
    id: "data",
    dir: "content/ · types/",
    items: [
      { p: "home.json", id: "home" },
      { p: "{about,how,donate,legal}.json", id: "sub" },
      { p: "types/analysis.ts", id: "types" },
    ],
  },
] as const;

const STEPS = ["paste", "ready", "post", "guard", "prompt", "stream", "sse", "reveal", "validate", "done"] as const;
const SSE_EVENTS = ["chunk", "progress", "result", "error"] as const;
const REVEAL = ["detected_language", "inferred_role", "score", "strengths", "improvements", "improved_cv"] as const;
const DECISIONS = ["model", "duration", "stream", "error"] as const;

const COPY = {
  es: {
    ovKicker: "Vista de 10 segundos",
    ovTitle: "El flujo, de un vistazo",
    ovLead: "Sin base de datos y sin cuentas. Tu CV entra, se analiza en memoria y se descarta. Todo ocurre en una sola petición que transmite la respuesta mientras se genera.",
    pipeline: {
      you: { t: "Tú", d: "pegas o subes el CV" },
      page: { t: "page.tsx", d: "valida y envía" },
      api: { t: "/api/analyze", d: "defiende y reenvía" },
      claude: { t: "Claude", d: "analiza en streaming" },
      result: { t: "Resultado", d: "se revela token a token" },
    } as Record<string, { t: string; d: string }>,

    stackKicker: "Los cimientos",
    stackTitle: "El stack",
    stackLead: "Pocas piezas, cada una con un trabajo claro. Cero librerías de UI: todo es HTML, CSS y un puñado de dependencias.",
    stack: {
      next: "El framework: define las rutas, ejecuta el servidor y compila el sitio.",
      react: "La interfaz, vive casi entera en una sola página.",
      tw: "Los estilos, con tokens de color en OKLCH y utilidades.",
      sdk: "El cliente oficial para hablar con la API de Claude.",
      claude: "El modelo que analiza el CV y también extrae el texto de los PDF.",
      sse: "El canal que transmite la respuesta en vivo, fragmento a fragmento.",
      pjson: "Lee el JSON cuando aún está a medio escribir, sin romperse.",
      analytics: "Analítica anónima y agregada: cuántas visitas, sin ningún dato personal.",
      vercel: "Donde vive el sitio y se ejecutan las funciones del servidor.",
    } as Record<string, string>,
    stackNote: "Seis dependencias de producción y cero librerías de UI — eso es deliberado. Herramientas de desarrollo (no llegan al navegador): TypeScript, ESLint, Turbopack y npm.",

    treeKicker: "El código",
    treeTitle: "El árbol de src/",
    treeLead: "Qué hace cada bloque. Abre cada carpeta para ver los archivos y su función.",
    treeGroups: {
      app: "La aplicación: la interfaz y las rutas de API.",
      lib: "La lógica: parseo, defensas, idioma y el prompt.",
      components: "Piezas de interfaz reutilizables.",
      data: "Texto traducible y contratos de tipos.",
    } as Record<string, string>,
    tree: {
      page: "Toda la interfaz en un archivo (~590 líneas): el formulario, los estados, el lector del stream SSE y el reveal progresivo del resultado.",
      layout: "Metadatos, fuentes (Geist), analytics y el schema JSON-LD para buscadores.",
      css: "Los tokens de color OKLCH, el estilo de los <details> y las animaciones. Sin CSS suelto en los componentes.",
      analyze: "La ruta que habla con Claude: defensas, prompt, streaming y reemisión como SSE. El corazón del backend.",
      parse: "Convierte un PDF en texto plano usando a Claude como extractor.",
      stream: "Parser de JSON incremental: arma el resultado mientras llega, sin esperar al final.",
      cors: "Lista blanca de orígenes permitidos y cabeceras CORS.",
      rate: "Limitador en memoria, best-effort: 7 análisis por hora por IP.",
      i18n: "Los helpers t() y dimName() y el tipo Lang; la copy vive en content/.",
      prompt: "El prompt constitucional (~550 líneas): los principios, el scoring y el formato exacto del JSON.",
      sublayout: "Header, footer y selector de idioma de las subpáginas (como esta).",
      counters: "Los contadores públicos y verificables (visitas, CVs analizados).",
      brand: "El logotipo, los iconos y otros componentes de UI compartidos.",
      home: "La copy de la home, en los cinco idiomas.",
      sub: "La copy de las subpáginas (es/en): about, how, donate, legal.",
      types: "Los tipos AnalysisResult y PartialResult: el contrato del JSON.",
    } as Record<string, string>,

    journeyKicker: "El recorrido",
    journeyTitle: "El viaje de la información",
    journeyLead: "Diez pasos, desde tu clic hasta el resultado. Cada uno trae su detalle técnico si quieres bajar una capa.",
    detail: "Ver el detalle técnico",
    steps: {
      paste: { t: "Pegas o subes tu CV", d: "Escribes el texto o adjuntas un PDF. Si es PDF, primero pasa por /api/parse, donde Claude extrae el texto.", tech: "handleFile() envía el archivo a /api/parse como multipart. El route manda el PDF a Claude como documento base64 y devuelve texto plano." },
      ready: { t: "El navegador valida", d: "Hasta que no hay al menos 50 caracteres, el botón sigue desactivado. Todavía no viaja nada.", tech: "ready = cvText.trim().length >= 50 && !loading && !parsing. Se recalcula en cada render." },
      post: { t: "Se envía a /api/analyze", d: "Una sola petición POST con tu CV (y el puesto objetivo, si lo diste). La respuesta no es un JSON normal: es un stream.", tech: "fetch('/api/analyze', { method:'POST', body: JSON.stringify({ cvText, targetRole }) }). Se lee con res.body.getReader()." },
      guard: { t: "El servidor se defiende", d: "Antes de gastar un solo token: rechaza peticiones enormes, comprueba el origen, limita la frecuencia y limpia el texto.", tech: "content-length > 4MB → 413 · validateOrigin (allowlist) · isRateLimited (7/h por IP) · clean() quita caracteres de control y recorta a 35.000." },
      prompt: { t: "Se arma el mensaje para Claude", d: "Tu CV se envuelve en etiquetas para que el modelo lo distinga de las instrucciones, y se le antepone el prompt constitucional.", tech: "system: analyze.txt con cache_control ephemeral. user: <cv_text>…</cv_text> + <target_role> opcional." },
      stream: { t: "Claude responde en streaming", d: "El modelo no contesta de golpe: va escribiendo el JSON del análisis token a token, y cada fragmento sale de inmediato.", tech: "anthropic.messages.stream({ model:'claude-sonnet-4-6', max_tokens:8000, temperature:0 }). Se itera sobre content_block_delta." },
      sse: { t: "El servidor lo reemite como SSE", d: "Cada fragmento se reenvía al navegador como un evento Server-Sent Event, etiquetado por tipo: fragmento, progreso, resultado o error.", tech: "event: chunk|progress|result|error, seguido de data: {…} y una línea en blanco. Connection keep-alive, Cache-Control no-cache." },
      reveal: { t: "El navegador revela mientras llega", d: "En vez de esperar al final, el cliente lee el JSON a medio escribir y va mostrando cada sección en cuanto está lista.", tech: "parsePartial() (partial-json) sobre el buffer acumulado → PartialResult. Los números se ocultan hasta estar completos para no parpadear." },
      validate: { t: "Se valida la forma final", d: "Cuando el JSON está completo, el servidor comprueba que tenga la estructura correcta antes de marcarlo como resultado.", tech: "isValidResult() verifica score.total (number), summary (string), los arrays de strengths/improvements e improved_cv. Si falla → event:error." },
      done: { t: "Resultado final, y nada se guarda", d: "El CV mejorado y el diagnóstico aparecen. Tu CV vivió solo en memoria durante la petición; al terminar, se descarta.", tech: "setResult() pinta la UI. No hay base de datos: el texto no se persiste en ningún lado." },
    } as Record<string, { t: string; d: string; tech: string }>,

    claudeKicker: "El núcleo",
    claudeTitle: "Cómo llega a Claude",
    claudeLead: "Una sola llamada a la API, en streaming. Esto es, en esencia, lo que recibe el modelo:",
    claudeNotes: {
      model: "Sonnet 4.6 es una decisión cerrada (comparada con Haiku 4.5 y Opus). La espera depende de cuántos tokens escribe (~5.600 ≈ 100s), no del tamaño del modelo.",
      temp: "temperature 0 hace la salida lo más determinista posible: el mismo CV produce un análisis estable.",
      cache: "El prompt del sistema se marca como cacheable (ephemeral): repetirlo abarata el costo, aunque no acelera la generación.",
      maxtok: "max_tokens 8.000 es un techo de seguridad; un análisis real ronda los 5.600 tokens.",
    } as Record<string, string>,

    sseKicker: "El truco",
    sseTitle: "El streaming, por dentro",
    sseLead: "Cuatro tipos de evento viajan por el mismo canal abierto:",
    sse: {
      chunk: "Un fragmento de texto recién generado. Se acumulan para reconstruir el JSON.",
      progress: "Cuántos tokens van; alimenta la barra de progreso. El último trae done: true.",
      result: "El JSON final, ya validado. Es la señal de que el análisis terminó.",
      error: "Algo falló: JSON inválido, forma incompleta, error de la API o límite alcanzado.",
    } as Record<string, string>,
    revealTitle: "El orden en que aparece",
    revealLead: "El JSON está diseñado para que los campos lleguen justo en el orden en que la interfaz los necesita:",
    revealNote: "Por eso ves primero el idioma y el puntaje, luego las fortalezas y las mejoras, y al final el CV reescrito creciendo letra a letra.",

    decKicker: "El porqué",
    decTitle: "Por qué estas decisiones",
    decLead: "Cuatro elecciones que parecen pequeñas y sostienen todo lo demás.",
    decisions: {
      model: { t: "¿Por qué Sonnet 4.6 y no un modelo más rápido?", d: "La espera es output-bound: casi todo el tiempo es el modelo escribiendo ~5.600 tokens. Un modelo más pequeño no lo arregla, así que cambiar de modelo no es una mejora de velocidad." },
      duration: { t: "¿Por qué la función dura hasta 300 segundos?", d: "Un análisis real tarda 60–120s. Si se bajara ese límite, el stream se cortaría a media generación y el resultado nunca llegaría — sin ningún error visible." },
      stream: { t: "¿Por qué SSE y no esperar el JSON completo?", d: "Cien segundos mirando un spinner se sienten rotos. Con SSE ves progreso real y secciones apareciendo; además evita que la petición caduque por timeout." },
      error: { t: "¿Por qué cualquier fallo se trata como error visible?", d: "Si la respuesta no es OK, el cliente muestra un mensaje en lugar de volver al formulario en silencio. Un fallo mudo es peor que un error claro." },
    } as Record<string, { t: string; d: string }>,

    privKicker: "La promesa",
    privTitle: "Privacidad por diseño",
    privLead: "No es una política, es la arquitectura:",
    privacy: [
      "Sin base de datos. El CV existe en memoria solo durante la petición.",
      "Sin cuentas y sin cookies de seguimiento.",
      "El limitador de frecuencia vive en memoria; se reinicia y no guarda historial.",
      "Los contadores públicos (visitas, CVs analizados) no contienen ningún dato personal y cualquiera puede verificarlos.",
    ],
    outro: "Eso es todo: una app pequeña, defensas claras, un stream y un prompt cuidado. La elegancia está en lo que no tiene.",
  },

  en: {
    ovKicker: "The 10-second view",
    ovTitle: "The flow, at a glance",
    ovLead: "No database, no accounts. Your CV comes in, is analyzed in memory, and is discarded. It all happens in a single request that streams the answer as it's generated.",
    pipeline: {
      you: { t: "You", d: "paste or upload the CV" },
      page: { t: "page.tsx", d: "validates and sends" },
      api: { t: "/api/analyze", d: "defends and relays" },
      claude: { t: "Claude", d: "analyzes, streaming" },
      result: { t: "Result", d: "revealed token by token" },
    } as Record<string, { t: string; d: string }>,

    stackKicker: "The foundations",
    stackTitle: "The stack",
    stackLead: "Few pieces, each with one clear job. Zero UI libraries: it's all HTML, CSS, and a handful of dependencies.",
    stack: {
      next: "The framework: defines routes, runs the server, builds the site.",
      react: "The interface, living almost entirely on one page.",
      tw: "The styles, with OKLCH color tokens and utilities.",
      sdk: "The official client for talking to Claude's API.",
      claude: "The model that analyzes the CV and also extracts text from PDFs.",
      sse: "The channel that streams the answer live, chunk by chunk.",
      pjson: "Reads the JSON while it's still half-written, without breaking.",
      analytics: "Anonymous, aggregate analytics: how many visits, with no personal data.",
      vercel: "Where the site lives and the server functions run.",
    } as Record<string, string>,
    stackNote: "Six production dependencies and zero UI libraries — that's deliberate. Dev tooling (never ships to the browser): TypeScript, ESLint, Turbopack, and npm.",

    treeKicker: "The code",
    treeTitle: "The src/ tree",
    treeLead: "What each block does. Open each folder to see the files and their role.",
    treeGroups: {
      app: "The application: the interface and the API routes.",
      lib: "The logic: parsing, defenses, language, and the prompt.",
      components: "Reusable interface pieces.",
      data: "Translatable copy and type contracts.",
    } as Record<string, string>,
    tree: {
      page: "The entire interface in one file (~590 lines): the form, the state, the SSE stream reader, and the progressive reveal of the result.",
      layout: "Metadata, fonts (Geist), analytics, and the JSON-LD schema for search engines.",
      css: "The OKLCH color tokens, the <details> styling, and the animations. No loose CSS in components.",
      analyze: "The route that talks to Claude: defenses, prompt, streaming, and re-emission as SSE. The heart of the backend.",
      parse: "Turns a PDF into plain text using Claude as the extractor.",
      stream: "Incremental JSON parser: assembles the result as it arrives, without waiting for the end.",
      cors: "Allowlist of permitted origins and CORS headers.",
      rate: "In-memory, best-effort limiter: 7 analyses per hour per IP.",
      i18n: "The t() and dimName() helpers and the Lang type; the copy lives in content/.",
      prompt: "The constitutional prompt (~550 lines): the principles, the scoring, and the exact JSON format.",
      sublayout: "Header, footer, and language switch for the sub-pages (like this one).",
      counters: "The public, verifiable counters (visits, CVs analyzed).",
      brand: "The logo, the icons, and other shared UI components.",
      home: "The home copy, in all five languages.",
      sub: "The sub-page copy (es/en): about, how, donate, legal.",
      types: "The AnalysisResult and PartialResult types: the JSON contract.",
    } as Record<string, string>,

    journeyKicker: "The journey",
    journeyTitle: "The journey of the data",
    journeyLead: "Ten steps, from your click to the result. Each one carries its technical detail if you want to go one layer deeper.",
    detail: "See the technical detail",
    steps: {
      paste: { t: "You paste or upload your CV", d: "You type the text or attach a PDF. If it's a PDF, it first goes through /api/parse, where Claude extracts the text.", tech: "handleFile() sends the file to /api/parse as multipart. The route hands the PDF to Claude as a base64 document and returns plain text." },
      ready: { t: "The browser validates", d: "Until there are at least 50 characters, the button stays disabled. Nothing travels yet.", tech: "ready = cvText.trim().length >= 50 && !loading && !parsing. Recomputed on every render." },
      post: { t: "It's sent to /api/analyze", d: "A single POST request with your CV (and the target role, if you gave one). The response isn't a normal JSON: it's a stream.", tech: "fetch('/api/analyze', { method:'POST', body: JSON.stringify({ cvText, targetRole }) }). Read with res.body.getReader()." },
      guard: { t: "The server defends itself", d: "Before spending a single token: it rejects huge requests, checks the origin, rate-limits, and cleans the text.", tech: "content-length > 4MB → 413 · validateOrigin (allowlist) · isRateLimited (7/h per IP) · clean() strips control chars and truncates to 35,000." },
      prompt: { t: "The message to Claude is assembled", d: "Your CV is wrapped in tags so the model tells it apart from instructions, and the constitutional prompt is prepended.", tech: "system: analyze.txt with cache_control ephemeral. user: <cv_text>…</cv_text> + optional <target_role>." },
      stream: { t: "Claude responds, streaming", d: "The model doesn't answer all at once: it writes the analysis JSON token by token, and each chunk goes out immediately.", tech: "anthropic.messages.stream({ model:'claude-sonnet-4-6', max_tokens:8000, temperature:0 }). Iterating content_block_delta." },
      sse: { t: "The server re-emits it as SSE", d: "Each chunk is forwarded to the browser as a Server-Sent Event, tagged by type: chunk, progress, result, or error.", tech: "event: chunk|progress|result|error, followed by data: {…} and a blank line. Connection keep-alive, Cache-Control no-cache." },
      reveal: { t: "The browser reveals as it arrives", d: "Instead of waiting for the end, the client reads the half-written JSON and shows each section the moment it's ready.", tech: "parsePartial() (partial-json) over the accumulated buffer → PartialResult. Numbers stay hidden until complete so they don't flicker." },
      validate: { t: "The final shape is validated", d: "Once the JSON is complete, the server checks it has the right structure before marking it as the result.", tech: "isValidResult() checks score.total (number), summary (string), the strengths/improvements arrays, and improved_cv. On failure → event:error." },
      done: { t: "Final result, and nothing is stored", d: "The improved CV and the diagnosis appear. Your CV only lived in memory during the request; when it ends, it's discarded.", tech: "setResult() paints the UI. There's no database: the text is never persisted anywhere." },
    } as Record<string, { t: string; d: string; tech: string }>,

    claudeKicker: "The core",
    claudeTitle: "How it reaches Claude",
    claudeLead: "A single API call, streaming. This is, in essence, what the model receives:",
    claudeNotes: {
      model: "Sonnet 4.6 is a settled decision (compared against Haiku 4.5 and Opus). The wait depends on how many tokens it writes (~5,600 ≈ 100s), not on model size.",
      temp: "temperature 0 makes the output as deterministic as possible: the same CV yields a stable analysis.",
      cache: "The system prompt is marked cacheable (ephemeral): reusing it lowers cost, though it doesn't speed up generation.",
      maxtok: "max_tokens 8,000 is a safety ceiling; a real analysis runs around 5,600 tokens.",
    } as Record<string, string>,

    sseKicker: "The trick",
    sseTitle: "Streaming, from the inside",
    sseLead: "Four event types travel over the same open channel:",
    sse: {
      chunk: "A freshly generated text fragment. They accumulate to rebuild the JSON.",
      progress: "How many tokens so far; feeds the progress bar. The last one carries done: true.",
      result: "The final, validated JSON. The signal that the analysis is done.",
      error: "Something failed: invalid JSON, incomplete shape, API error, or rate limit hit.",
    } as Record<string, string>,
    revealTitle: "The order it appears in",
    revealLead: "The JSON is designed so the fields arrive in exactly the order the interface needs them:",
    revealNote: "That's why you see the language and the score first, then the strengths and improvements, and finally the rewritten CV growing letter by letter.",

    decKicker: "The why",
    decTitle: "Why these decisions",
    decLead: "Four choices that look small and hold up everything else.",
    decisions: {
      model: { t: "Why Sonnet 4.6 and not a faster model?", d: "The wait is output-bound: almost all of it is the model writing ~5,600 tokens. A smaller model doesn't fix that, so swapping models isn't a speed improvement." },
      duration: { t: "Why does the function run up to 300 seconds?", d: "A real analysis takes 60–120s. Lower that limit and the stream would be cut mid-generation and the result would never arrive — with no visible error." },
      stream: { t: "Why SSE instead of waiting for the full JSON?", d: "A hundred seconds staring at a spinner feels broken. With SSE you see real progress and sections appearing; it also keeps the request from timing out." },
      error: { t: "Why is any failure treated as a visible error?", d: "If the response isn't OK, the client shows a message instead of silently returning to the form. A mute failure is worse than a clear error." },
    } as Record<string, { t: string; d: string }>,

    privKicker: "The promise",
    privTitle: "Privacy by design",
    privLead: "It's not a policy, it's the architecture:",
    privacy: [
      "No database. The CV exists in memory only during the request.",
      "No accounts and no tracking cookies.",
      "The rate limiter lives in memory; it resets and keeps no history.",
      "The public counters (visits, CVs analyzed) contain no personal data and anyone can verify them.",
    ],
    outro: "That's all: a small app, clear defenses, one stream, and a carefully written prompt. The elegance is in what it leaves out.",
  },
} as const;

function Chevron() {
  return (
    <svg className="summary-chevron w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SectionHead({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <div className="map-reveal">
      <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-accent mb-3">{kicker}</div>
      <h2 className="text-xl sm:text-2xl font-medium text-ink-900 tracking-tight leading-tight">{title}</h2>
      {lead && <p className="text-sm text-ink-500 mt-2 max-w-2xl leading-relaxed">{lead}</p>}
    </div>
  );
}

function TechDetail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <details className="mt-3">
      <summary className="inline-flex items-center gap-1.5 text-xs font-[family-name:var(--font-mono)] text-accent cursor-pointer select-none hover:text-accent-dim transition">
        <Chevron />
        {label}
      </summary>
      <div className="mt-2 ml-[18px] pl-3 border-l border-ink-100 text-[13px] leading-relaxed text-ink-500 font-[family-name:var(--font-mono)]">{children}</div>
    </details>
  );
}

export default function TechMap({ lang }: { lang: "es" | "en" }) {
  const t = COPY[lang];

  // Reveal-on-scroll: add .map-in once when each element enters the viewport.
  useEffect(() => {
    const els = document.querySelectorAll(".map-reveal, .map-rail");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("map-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  return (
    <div className="space-y-16">
      {/* 10-second overview pipeline */}
      <section className="space-y-6">
        <SectionHead kicker={t.ovKicker} title={t.ovTitle} lead={t.ovLead} />
        <div className="map-reveal overflow-x-auto pb-1">
          <div className="inline-flex items-stretch min-w-full">
            {PIPELINE.map((id, i) => {
              const node = t.pipeline[id];
              if (!node) return null;
              const isClaude = id === "claude";
              return (
                <div key={id} className="flex items-stretch">
                  <div className="shrink-0 w-[136px] border border-ink-100 rounded-lg bg-ink-000 p-3">
                    <div className={`font-[family-name:var(--font-mono)] text-xs ${isClaude ? "text-accent" : "text-ink-900"}`}>{node.t}</div>
                    <div className="text-[11px] text-ink-400 mt-1 leading-snug">{node.d}</div>
                  </div>
                  {i < PIPELINE.length - 1 && (
                    <div className="map-conn self-center grow">
                      <span className="map-dot" style={{ animationDelay: `${i * 0.55}s` }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stack */}
      <section className="space-y-6">
        <SectionHead kicker={t.stackKicker} title={t.stackTitle} lead={t.stackLead} />
        <div className="map-reveal border border-ink-100 rounded-lg divide-y divide-ink-100">
          {STACK.map((s) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3">
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-900 sm:w-48 shrink-0">{s.name}</span>
              <span className="text-sm text-ink-500 leading-relaxed">{t.stack[s.id]}</span>
            </div>
          ))}
        </div>
        <p className="map-reveal text-[13px] text-ink-400 leading-relaxed max-w-2xl">{t.stackNote}</p>
      </section>

      {/* Code tree */}
      <section className="space-y-6">
        <SectionHead kicker={t.treeKicker} title={t.treeTitle} lead={t.treeLead} />
        <div className="map-reveal space-y-3">
          {TREE.map((g) => (
            <details key={g.id} open={g.id === "app"} className="border border-ink-100 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 flex items-center gap-2 cursor-pointer select-none">
                <Chevron />
                <span className="font-[family-name:var(--font-mono)] text-sm text-ink-700">{g.dir}</span>
                <span className="text-xs text-ink-400 ml-1">{t.treeGroups[g.id]}</span>
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {g.items.map((it, j) => (
                  <div key={it.id} className={`flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 ${j > 0 ? "border-t border-ink-100 pt-2" : ""}`}>
                    <span className="font-[family-name:var(--font-mono)] text-[13px] text-accent sm:w-60 shrink-0">{it.p}</span>
                    <span className="text-[13px] text-ink-500 leading-relaxed">{t.tree[it.id]}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* The journey (vertical sequence) */}
      <section className="space-y-6">
        <SectionHead kicker={t.journeyKicker} title={t.journeyTitle} lead={t.journeyLead} />
        <ol className="relative mt-2">
          <span className="map-rail absolute left-4 top-3 bottom-3 w-px bg-ink-200" aria-hidden="true" />
          {STEPS.map((id, i) => {
            const s = t.steps[id];
            if (!s) return null;
            return (
              <li key={id} className="map-reveal relative pl-12 pb-8 last:pb-0">
                <span className="absolute left-0 top-0 grid place-items-center w-8 h-8 rounded-full border border-ink-200 bg-ink-000 font-[family-name:var(--font-mono)] text-xs text-ink-500">{i + 1}</span>
                <h3 className="text-sm font-medium text-ink-900 leading-snug pt-1">{s.t}</h3>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">{s.d}</p>
                <TechDetail label={t.detail}>{s.tech}</TechDetail>
              </li>
            );
          })}
        </ol>
      </section>

      {/* How it reaches Claude (the call) */}
      <section className="space-y-6">
        <SectionHead kicker={t.claudeKicker} title={t.claudeTitle} lead={t.claudeLead} />
        <pre className="map-reveal font-[family-name:var(--font-mono)] text-[12.5px] leading-relaxed text-ink-600 bg-ink-050 border border-ink-100 rounded-lg p-4 overflow-x-auto">
{`anthropic.messages.stream({
  model:       "claude-sonnet-4-6",
  max_tokens:  8_000,
  temperature: 0,
  system:   [{ text: analyze.txt, cache_control: "ephemeral" }],
  messages: [{ role: "user", content: "<cv_text>…</cv_text>" }],
})`}
        </pre>
        <div className="map-reveal border border-ink-100 rounded-lg divide-y divide-ink-100">
          {(["model", "temp", "cache", "maxtok"] as const).map((k) => (
            <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3">
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-accent sm:w-32 shrink-0">
                {k === "model" ? "model" : k === "temp" ? "temperature" : k === "cache" ? "cache_control" : "max_tokens"}
              </span>
              <span className="text-[13px] text-ink-500 leading-relaxed">{t.claudeNotes[k]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SSE events + reveal order */}
      <section className="space-y-6">
        <SectionHead kicker={t.sseKicker} title={t.sseTitle} lead={t.sseLead} />
        <div className="map-reveal border border-ink-100 rounded-lg divide-y divide-ink-100">
          {SSE_EVENTS.map((e) => (
            <div key={e} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 p-3">
              <span className="font-[family-name:var(--font-mono)] text-[13px] text-ink-900 sm:w-36 shrink-0">event: {e}</span>
              <span className="text-[13px] text-ink-500 leading-relaxed">{t.sse[e]}</span>
            </div>
          ))}
        </div>

        <div className="map-reveal pt-2">
          <h3 className="text-sm font-medium text-ink-900">{t.revealTitle}</h3>
          <p className="text-sm text-ink-500 mt-1 leading-relaxed max-w-2xl">{t.revealLead}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2 mt-4">
            {REVEAL.map((f, i) => (
              <span key={f} className="inline-flex items-center gap-2">
                <span className="font-[family-name:var(--font-mono)] text-[12px] text-ink-600 border border-ink-100 rounded-lg px-2.5 py-1">{f}</span>
                {i < REVEAL.length - 1 && <span className="text-ink-300 font-[family-name:var(--font-mono)] text-xs">→</span>}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-ink-400 mt-4 leading-relaxed max-w-2xl">{t.revealNote}</p>
        </div>
      </section>

      {/* Design decisions */}
      <section className="space-y-6">
        <SectionHead kicker={t.decKicker} title={t.decTitle} lead={t.decLead} />
        <div className="map-reveal space-y-2">
          {DECISIONS.map((id) => {
            const d = t.decisions[id];
            if (!d) return null;
            return (
              <details key={id} className="border border-ink-100 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-ink-700">
                  <Chevron />
                  {d.t}
                </summary>
                <p className="px-4 pb-4 pl-[34px] text-sm text-ink-500 leading-relaxed">{d.d}</p>
              </details>
            );
          })}
        </div>
      </section>

      {/* Privacy */}
      <section className="space-y-6">
        <SectionHead kicker={t.privKicker} title={t.privTitle} lead={t.privLead} />
        <ul className="map-reveal border border-ink-100 rounded-lg divide-y divide-ink-100">
          {t.privacy.map((p, i) => (
            <li key={i} className="flex items-start gap-3 p-3 text-sm text-ink-600 leading-relaxed">
              <span className="text-accent shrink-0 mt-0.5">·</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="map-reveal text-sm text-ink-500 leading-relaxed max-w-2xl bg-ink-050 border border-ink-100 rounded-lg p-4">{t.outro}</p>
      </section>
    </div>
  );
}
