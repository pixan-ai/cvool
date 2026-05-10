"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { t, dimName } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import type { AnalysisResult, PartialResult } from "@/types/analysis";
import { parsePartial } from "@/lib/streamParse";
import { CvoolBrand as Cv, CvoolText } from "@/components/CvoolBrand";
import { FaviconIcon } from "@/components/FaviconIcon";
import { GitHubIcon, XIcon, BuyMeACoffeeIcon } from "@/components/icons";
import { CvsAnalyzedCount, FooterPublicCounters } from "@/components/PublicCounters";
import { StepBadge } from "@/components/StepBadge";

const LANGS: Lang[] = ["es", "en", "fr", "pt", "it"];

// Renders a string that may contain **bold markers** as JSX with <strong>
// tags around the marked sections. Lets us keep i18n keys as single strings
// instead of fragmenting them into 3-4 sub-keys per phrase.
function BoldMarkers({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
          : part
      )}
    </>
  );
}

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg className={`summary-chevron w-3.5 h-3.5 shrink-0 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ResumeText({ text }: { text: string }) {
  return (
    <div className="text-sm leading-relaxed text-ink-700">
      {text.split("\n").map((line, i) => {
        const trimmed = line.trimStart();
        const isBullet = trimmed.startsWith("\u2022") || trimmed.startsWith("\u00b7") || trimmed.startsWith("\u2023") || trimmed.startsWith("- ");
        if (isBullet) {
          const bulletChar = trimmed.match(/^(\u2022|\u00b7|\u2023|- )/)?.[0] ?? "\u2022";
          const content = trimmed.slice(bulletChar.length).trimStart();
          return <p key={i} className="m-0 ml-4"><span className="inline-block w-4 -ml-4 text-ink-400">{bulletChar.trim()}</span>{content}</p>;
        }
        if (line.trim() === "") return <div key={i} className="h-3" />;
        const isHeader = line === line.toUpperCase() && line.trim().length > 2 && /^[A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\u00dc\s&/\-:]+$/.test(line.trim());
        if (isHeader) return <p key={i} className="m-0 font-medium text-ink-900 mt-5 mb-1">{line}</p>;
        return <p key={i} className="m-0">{line}</p>;
      })}
    </div>
  );
}

// Builds an HTML representation of the improved CV used as the text/html
// flavor on the clipboard. <ul><li> ensures Word/Docs/Outlook apply their
// native list style with hanging indent — fixes the wrap-to-margin issue
// that plain text causes when bullets contain multi-line content.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cvTextToHtml(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const trimmed = raw.trimStart();
    const isBullet = /^[\u2022\u00b7\u2023]/.test(trimmed) || trimmed.startsWith("- ");
    if (isBullet) {
      if (!inList) { out.push("<ul>"); inList = true; }
      const content = trimmed.replace(/^[\u2022\u00b7\u2023]\s*|^- /, "");
      out.push(`<li>${escapeHtml(content)}</li>`);
      continue;
    }
    if (inList) { out.push("</ul>"); inList = false; }
    if (trimmed === "") { out.push("<p>&nbsp;</p>"); continue; }
    const isHeader = raw === raw.toUpperCase() && raw.trim().length > 2 && /^[A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\u00dc\s&/\-:]+$/.test(raw.trim());
    if (isHeader) { out.push(`<p><strong>${escapeHtml(raw)}</strong></p>`); continue; }
    out.push(`<p>${escapeHtml(raw)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("");
}

function extractCvMetadata(cv: string) {
  const words = cv.trim().split(/\s+/).filter(Boolean).length;
  const bullets = (cv.match(/^[\s]*[\u2022\u00b7\u2023\-*]/gm) ?? []).length;
  const withMetrics = (cv.match(/\d+\s*%|[$\u20ac\u00a3]\s*\d|\d+\s*[KMB]\b/g) ?? []).length;
  const sections = cv.split("\n").filter(line => {
    const t = line.trim();
    return t.length > 2 && t === t.toUpperCase() && /^[A-Z\u00c1\u00c9\u00cd\u00d3\u00da\u00d1\u00dc\s&\/\-:]+$/.test(t);
  }).length;
  return { words, bullets, withMetrics, sections };
}

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "es";
  const raw = navigator.language?.toLowerCase() ?? "";
  if (raw.startsWith("es")) return "es";
  if (raw.startsWith("pt")) return "pt";
  if (raw.startsWith("fr")) return "fr";
  if (raw.startsWith("it")) return "it";
  if (raw.startsWith("en")) return "en";
  return "en";
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("es");
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [partialResult, setPartialResult] = useState<PartialResult>({});
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [streamTokens, setStreamTokens] = useState(0);
  const [streamDone, setStreamDone] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const chunkBufferRef = useRef("");
  const seenLangRef = useRef(false);

  useEffect(() => { setLang(detectLang()); }, []);

  useEffect(() => {
    if (!loading) {
      setElapsedMs(0);
      return;
    }
    const start = Date.now();
    const id = setInterval(() => {
      setElapsedMs(Date.now() - start);
    }, 200);
    return () => clearInterval(id);
  }, [loading]);

  const ui = t(lang);
  const ready = cvText.trim().length >= 50 && !loading && !parsing;
  const cvMetadata = useMemo(() => cvText.trim().length >= 50 ? extractCvMetadata(cvText) : null, [cvText]);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== "application/pdf") return;
    setParsing(true); setError(null);
    track("pdf_uploaded", { size_kb: Math.round(file.size / 1024) });
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/parse", { method: "POST", body: fd });
      if (!res.ok) { setError(ui.errorPdf); return; }
      const data = await res.json();
      if (data.text?.trim().length > 10) { setCvText(data.text); track("pdf_parsed", { chars: data.text.length }); }
      else { setError(ui.errorPdf); }
    } catch { setError(ui.errorPdf); } finally { setParsing(false); }
  }, [ui.errorPdf]);

  const analyze = async () => {
    if (!ready) return;
    setLoading(true); setError(null); setResult(null); setPartialResult({}); setStreamTokens(0); setStreamDone(false);
    chunkBufferRef.current = "";
    seenLangRef.current = false;
    track("analysis_started", { has_role: targetRole.trim().length > 0 });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole: targetRole || undefined }),
      });
      if (!res.ok) {
        setError(res.status === 429 ? ui.errorLimit : ui.errorGeneric);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) { setError(ui.errorGeneric); return; }
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("event: ")) { currentEvent = line.slice(7); }
          else if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              if (currentEvent === "progress") {
                setStreamTokens(parsed.tokens || 0);
                if (parsed.done) setStreamDone(true);
              }
              else if (currentEvent === "chunk") {
                chunkBufferRef.current += parsed.delta || "";
                const partial = parsePartial(chunkBufferRef.current);
                setPartialResult(partial);
                // Switch UI language as soon as the model declares it.
                // Only fire once per analysis to avoid fighting the user
                // if the model emits something unexpected.
                if (!seenLangRef.current && partial.detected_language) {
                  seenLangRef.current = true;
                  const dl = partial.detected_language as Lang;
                  if (LANGS.includes(dl)) setLang(dl);
                }
              }
              else if (currentEvent === "result") {
                const r = parsed as AnalysisResult;
                fetch("https://abacus.jasoncameron.dev/hit/cvool/cvs-analyzed").catch(() => {});
                setResult(r);
                track("analysis_completed", { score: r.score.total, lang: r.detected_language });
                const dl = r.detected_language as Lang;
                if (LANGS.includes(dl)) setLang(dl);
                setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
              } else if (currentEvent === "error") {
                setError(parsed.error === "parse_error" ? (ui.errorRetry || ui.errorGeneric) : ui.errorGeneric);
              }
            } catch { /* ignore */ }
          } else if (line === "") {
            currentEvent = "";
          }
        }
      }
    } catch { setError(ui.errorConnection); } finally { setLoading(false); setStreamTokens(0); setStreamDone(false); }
  };

  const copy = async () => {
    if (!result) return;
    try {
      const text = result.improved_cv.text;
      // Provide both flavors: text/html so Word/Docs/Outlook render the
      // bullets as a list with hanging indent, text/plain as fallback for
      // editors that don't accept HTML.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        const html = cvTextToHtml(text);
        await navigator.clipboard.write([new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        })]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true); setTimeout(() => setCopied(false), 2000);
      track("cv_copied");
    } catch { /* clipboard API unavailable */ }
  };

  const reset = () => {
    setCvText(""); setTargetRole(""); setResult(null); setPartialResult({});
    setError(null); setCopied(false); setStreamTokens(0); setStreamDone(false);
    chunkBufferRef.current = ""; seenLangRef.current = false;
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    track("reset_clicked");
  };

  const timePct = Math.min(80, (elapsedMs / 25000) * 80);
  const tokenPct = streamTokens > 0 ? Math.min(80, (streamTokens / 1000) * 100) : 0;
  const progressPct = streamDone ? 100 : Math.round(Math.max(timePct, tokenPct));
  const displayPct = progressPct === 0 ? 0 : Math.max(progressPct, 4);

  // Streaming preview: when the model has started writing improved_cv.text,
  // sections 1-3 are already fully populated in partialResult (they precede
  // improved_cv in the JSON), so we reveal the full results block. Section 4
  // grows letter by letter; copy button stays gated by `result` so users
  // can't grab a half-written CV.
  const data: PartialResult = result ?? partialResult;
  const streamingPreview = !result && !!data.improved_cv?.text;

  return (
    <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">
      <header>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-[2px] font-[family-name:var(--font-geist)] text-[24px] font-medium tracking-tight"><FaviconIcon size="w-[25px] h-[25px]" /><Cv /></span>
          <div className="flex items-center gap-3">
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Language"
              className="text-xs font-medium text-ink-500 bg-transparent border border-ink-100 rounded-lg px-2 py-1 focus:outline-none focus:border-accent cursor-pointer">
              {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-ink-600 transition" aria-label="GitHub">
              <GitHubIcon />
            </a>
          </div>
        </div>
      </header>

      <section className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-[28px] font-medium text-ink-900 tracking-tight leading-tight">
          {ui.heroTitle}<br /><span className="text-accent">{ui.heroAccent}</span>
        </h1>
        <p className="text-sm text-ink-700"><BoldMarkers text={ui.heroSub} /></p>
        <p className="text-sm text-ink-500">{ui.heroExplain}</p>
      </section>

      {(loading || parsing) && !result && !streamingPreview && (
        <div className="text-center py-6 space-y-4" aria-live="polite">
          {parsing ? <p className="text-sm text-ink-400 animate-pulse">{ui.uploadingPdf}</p> : (
            <>
              <p className="text-sm text-ink-400 animate-pulse">
                {progressPct >= 80 ? ui.analyzingAlmostDone : streamTokens > 0 ? ui.analyzingWriting : ui.analyzingReading}
              </p>
              <div className="max-w-xs mx-auto">
                <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-200 ease-out" style={{ width: `${displayPct}%` }} />
                </div>
              </div>
              {cvMetadata && (
                <div className="flex flex-wrap justify-center gap-6 tabular-nums pt-1">
                  <div className={`text-center transition-opacity duration-700 ${progressPct >= 15 ? "opacity-100" : "opacity-0"}`}>
                    <div className="text-2xl font-medium text-ink-900">{cvMetadata.words.toLocaleString(lang, { useGrouping: true })}</div>
                    <div className="text-xs text-ink-400 mt-1">{ui.metaWords}</div>
                  </div>
                  <div className={`text-center transition-opacity duration-700 ${progressPct >= 30 ? "opacity-100" : "opacity-0"}`}>
                    <div className="text-2xl font-medium text-ink-900">{cvMetadata.sections}</div>
                    <div className="text-xs text-ink-400 mt-1">{ui.metaSections}</div>
                  </div>
                  <div className={`text-center transition-opacity duration-700 ${progressPct >= 45 ? "opacity-100" : "opacity-0"}`}>
                    <div className="text-2xl font-medium text-ink-900">{cvMetadata.bullets}</div>
                    <div className="text-xs text-ink-400 mt-1">{ui.metaBullets}</div>
                  </div>
                  <div className={`text-center transition-opacity duration-700 ${progressPct >= 60 ? "opacity-100" : "opacity-0"}`}>
                    <div className="text-2xl font-medium text-ink-900">{cvMetadata.withMetrics}</div>
                    <div className="text-xs text-ink-400 mt-1">{ui.metaWithMetrics}</div>
                  </div>
                </div>
              )}
              <p className="text-xs text-ink-400 leading-relaxed">{ui.analyzingDisclaimer}</p>
            </>
          )}
        </div>
      )}

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {!result && !loading && !parsing && (
        <section className="space-y-3 pt-2">
          <div className="flex gap-2 items-start">
            <div className="pt-2"><StepBadge n={1} /></div>
            <div className="flex-1">
              <div className="relative border border-ink-100 rounded-lg bg-ink-000 focus-within:border-accent transition">
                <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder={ui.placeholder} aria-label="CV text"
                  className="w-full min-h-[90px] p-3 text-sm text-ink-700 bg-transparent placeholder:text-ink-300 resize-y focus:outline-none rounded-lg" />
              </div>
              <div className="flex justify-end mt-1">
                <button type="button" onClick={() => fileRef.current?.click()} aria-label="Upload PDF"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-dim transition cursor-pointer">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  {ui.attachPdf}
                </button>
                <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-start">
            <div className="pt-2"><StepBadge n={2} /></div>
            <div className="flex-1">
              <textarea
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={`${ui.targetRole}. ${ui.targetRoleHelp}`}
                maxLength={500}
                rows={2}
                aria-label="Target role"
                className="w-full p-3 text-sm text-ink-700 bg-ink-000 border border-ink-100 rounded-lg placeholder:text-ink-300 resize-none focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <StepBadge n={3} />
            <button onClick={analyze} disabled={!ready}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition cursor-pointer active:scale-[0.98] ${ready ? "bg-accent text-white hover:bg-accent-dim" : "bg-ink-200 text-ink-400 cursor-not-allowed"}`}>
              {ui.btnAnalyze}
            </button>
          </div>

          <p className="text-xs text-ink-500 text-center leading-relaxed pt-2">{ui.analyzeFooter}</p>
        </section>
      )}

      {(result || streamingPreview) && (
        <div ref={resultsRef} className="space-y-3">
          <p className="text-xs text-accent font-medium">{ui.expandHint}</p>

          <div className="flex gap-2 items-center">
            <StepBadge n={1} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.originalCvTitle}</summary>
              <div className="px-4 pb-4 text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">{cvText}</div>
            </details>
          </div>

          {(targetRole || data.inferred_role || !loading) && (
            <div className="flex gap-2 items-center">
              <StepBadge n={2} />
              <details className="flex-1 border border-ink-100 rounded-lg">
                <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.targetRoleTitle}</summary>
                {/* min-h reserves vertical space for up to 2 wrapped lines so
                    the role growing left-to-right doesn't push content below. */}
                <p className="px-4 pb-3 text-sm text-ink-500 min-h-[2.5em]">
                  {targetRole || (data.inferred_role
                    ? <>{ui.inferredRoleNote} <strong className="text-ink-700">{data.inferred_role}</strong></>
                    : ui.notSpecified
                  )}
                </p>
              </details>
            </div>
          )}

          {(data.score?.total != null || data.score?.summary || data.analysis?.strengths || data.analysis?.improvements) && (
            <div className="flex gap-2 items-center">
              <StepBadge n={3} />
              <details className="flex-1 border border-ink-100 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 text-sm font-medium text-accent bg-accent-ghost cursor-pointer flex items-center gap-2"><Chevron className="text-accent" />{ui.analysisTitle}</summary>
                <div className="p-4 space-y-4">
                  {(data.score?.total != null || data.score?.summary) && (
                    <details open className="border border-ink-100 rounded-lg">
                      <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300" />{ui.scoreSummaryTitle}</summary>
                      <div className="px-4 pb-4">
                        {data.score?.total != null && (
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="font-[family-name:var(--font-mono)] text-ink-400">{data.score.total}/100</span>
                            <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-300 tracking-wide">— {ui.scoreMeta}</span>
                          </div>
                        )}
                        {/* min-h reserves space for the multi-line summary so
                            growing text doesn't push later sections down. */}
                        <p className="text-sm text-ink-600 leading-relaxed min-h-[5em]">{data.score?.summary ?? ""}</p>
                      </div>
                    </details>
                  )}
                  {(data.analysis?.strengths?.length ?? 0) > 0 && (
                    <details className="border border-positive/20 rounded-lg bg-positive-ghost">
                      <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-positive hint-chevron" />{ui.strengthsTitle}</summary>
                      <div className="px-4 pb-4 space-y-2">
                        {data.analysis!.strengths!.map((s, i) => (
                          <div key={i} className="border border-positive/20 rounded-lg p-3 bg-ink-000">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-ink-700">{dimName(s.dimension, lang)}</span>
                              <span className="font-[family-name:var(--font-mono)] text-[11px] text-positive tracking-wide">{s.dimension_score}/100</span>
                            </div>
                            <p className="text-sm text-ink-600">{s.detail}</p>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  {(data.analysis?.improvements?.length ?? 0) > 0 && (
                    <details className="border border-ink-100 rounded-lg">
                      <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.improvementsTitle}</summary>
                      <div className="px-4 pb-4 space-y-3">
                        {data.analysis!.improvements!.map((imp, i) => (
                          <div key={i} className="border border-ink-100 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-ink-700">{dimName(imp.dimension, lang)}</span>
                              <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-400 tracking-wide uppercase">{imp.dimension_score}/100</span>
                            </div>
                            <p className="text-sm text-ink-600">{imp.issue}</p>
                            <p className="text-sm text-ink-500">{imp.suggestion}</p>
                            {imp.before && imp.after && (
                              <div className="grid gap-2 text-xs">
                                <div className="bg-ink-050 rounded-lg p-3">
                                  <span className="font-[family-name:var(--font-mono)] text-ink-400 uppercase tracking-wide text-[11px]">{ui.before}</span>
                                  <p className="text-ink-500 mt-1">{imp.before}</p>
                                </div>
                                <div className="bg-positive-ghost rounded-lg p-3">
                                  <span className="font-[family-name:var(--font-mono)] text-positive uppercase tracking-wide text-[11px]">{ui.after}</span>
                                  <p className="text-ink-700 mt-1">{imp.after}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </details>
            </div>
          )}

          {(data.improved_cv?.text || (data.improved_cv?.changes?.length ?? 0) > 0) && (
            <div className="flex gap-2 items-start">
              <div className="pt-3"><StepBadge n={4} /></div>
              <details open className="flex-1 border border-accent/30 rounded-lg overflow-hidden">
                <summary className="px-4 py-3 text-sm font-medium text-white bg-accent cursor-pointer flex items-center gap-2">
                  <Chevron className="text-white/70" />
                  {ui.improvedCvTitle}
                  {streamingPreview && <span className="ml-auto inline-block w-2 h-2 rounded-full bg-white/70 animate-pulse" aria-label="streaming" />}
                </summary>
                <div className="p-4 space-y-3">
                  {(data.improved_cv?.changes?.length ?? 0) > 0 && (
                    <details className="border border-ink-100 rounded-lg">
                      <summary className="px-4 py-3 text-sm font-medium text-ink-600 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.changesTitle}</summary>
                      <ul className="px-4 pb-3 space-y-1">
                        {data.improved_cv!.changes!.map((c, i) => <li key={i} className="flex gap-2 text-sm text-ink-500"><span className="text-positive shrink-0">+</span>{c}</li>)}
                      </ul>
                    </details>
                  )}
                  {data.improved_cv?.text && (
                    <details open className="border border-accent/30 rounded-lg">
                      <summary className="px-4 py-3 text-sm font-medium text-accent flex items-center gap-2"><Chevron className="text-accent" />{ui.newTextTitle}</summary>
                      <div className="px-4 pb-4 space-y-3">
                        <ResumeText text={data.improved_cv.text} />
                        {result && (
                          <button onClick={copy} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ink-200 text-sm text-ink-600 hover:border-accent hover:text-accent transition cursor-pointer">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {copied ? ui.copied : ui.copy}
                          </button>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </details>
            </div>
          )}

          {result && (
            <>
              <div className="flex items-center justify-between gap-4 border border-ink-100 rounded-xl bg-ink-050 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink-700 leading-snug">☕ {ui.donationLine1}</p>
                  <p className="text-xs text-ink-400 mt-0.5 leading-snug">{ui.donationLine2}</p>
                </div>
                <a
                  href="https://buymeacoffee.com/cvool"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("donation_clicked")}
                  className="shrink-0 px-3 py-2 rounded-lg text-xs font-bold text-ink-900 transition hover:opacity-90"
                  style={{ backgroundColor: "#FFDD00" }}
                >
                  {ui.donationCta}
                </a>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-ink-400 leading-relaxed">{ui.aiDisclaimer}</p>
                <button onClick={reset} className="text-sm text-accent hover:text-accent-dim transition cursor-pointer">{ui.tryAgain}</button>
              </div>
            </>
          )}
        </div>
      )}

      {!result && !loading && !parsing && (
        <div className="flex justify-center pt-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ink-100 px-3 py-1">
            <CvsAnalyzedCount lang={lang} />
            <span className="text-xs text-ink-500">{ui.socialProofText}</span>
          </div>
        </div>
      )}

      <footer className="pt-4 pb-4 space-y-3">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <Link href="/how" className="hover:text-ink-700 transition">{ui.footerHow}</Link>
          <Link href="/about" className="hover:text-ink-700 transition">{ui.footerAbout}</Link>
          <Link href="/legal" className="hover:text-ink-700 transition">{ui.footerLegal}</Link>
          <Link href="/donate" onClick={() => track("donation_clicked")} className="hover:text-ink-700 transition">{ui.footerDonate}</Link>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
          <span className="inline-flex items-center gap-[2px] font-medium"><FaviconIcon size="w-4 h-4" /><Cv /></span>
          <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="GitHub">
            <GitHubIcon />
          </a>
          <a href="https://x.com/cvoolorg" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="X">
            <XIcon />
          </a>
          <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")} className="hover:text-ink-600 transition">
            <BuyMeACoffeeIcon />
          </a>
        </div>
        <FooterPublicCounters lang={lang} />
      </footer>
    </div>
  );
}
