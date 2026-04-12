"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { t, dimName } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import type { AnalysisResult } from "@/types/analysis";

const LANGS: Lang[] = ["es", "en", "fr", "pt", "it"];

const Cv = () => <span><span className="text-ink-900">CV</span><span className="text-accent">ool</span></span>;

const FaviconIcon = ({ size = "w-5 h-5" }: { size?: string }) => (
  <svg className={`${size} shrink-0`} viewBox="0 0 16 28" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="6.5" fill="#99bbee" />
    <circle cx="8" cy="20" r="6.5" fill="#4466cc" />
  </svg>
);

function CvoolText({ text, className }: { text: string; className?: string }) {
  const parts = text.split("cvool");
  if (parts.length === 1) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {parts.map((part, i) => (
        <span key={i}>{part}{i < parts.length - 1 && <Cv />}</span>
      ))}
    </span>
  );
}

function Badge({ n }: { n: number }) {
  return <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-medium flex items-center justify-center">{n}</span>;
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

const DONATION_COPY = {
  es: { line1: "CVool siempre ser\u00e1 gratis.", line2: "Cuando encuentres ese trabajo que te cambia la vida, regresa a ayudar.", cta: "Apoyar CVool \u2192" },
  en: { line1: "CVool will always be free.", line2: "When you land that life-changing job, come back and help keep it going.", cta: "Support CVool \u2192" },
  fr: { line1: "CVool sera toujours gratuit.", line2: "Quand vous d\u00e9crochez le poste qui change votre vie, revenez nous aider.", cta: "Soutenir CVool \u2192" },
  pt: { line1: "CVool ser\u00e1 sempre gratuito.", line2: "Quando voc\u00ea conseguir aquele emprego que muda sua vida, volte para ajudar.", cta: "Apoiar CVool \u2192" },
  it: { line1: "CVool sar\u00e0 sempre gratuito.", line2: "Quando troverai quel lavoro che ti cambia la vita, torna ad aiutarci.", cta: "Sostenere CVool \u2192" },
} as const;

export default function Home() {
  const [lang, setLang] = useState<Lang>("es");
  const [cvText, setCvText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [streamTokens, setStreamTokens] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const ui = t(lang);
  const ready = cvText.trim().length >= 50 && !loading && !parsing;

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
    setLoading(true); setError(null); setResult(null); setStreamTokens(0);
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
      // currentEvent must persist across chunk reads: SSE "event:" and "data:"
      // lines for the same message can arrive in different TCP chunks.
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
              if (currentEvent === "progress") { setStreamTokens(parsed.tokens || 0); }
              else if (currentEvent === "result") {
                const r = parsed as AnalysisResult;
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
            // Empty line marks end of an SSE message — reset event type.
            currentEvent = "";
          }
        }
      }
    } catch { setError(ui.errorConnection); } finally { setLoading(false); setStreamTokens(0); }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved_cv.text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    track("cv_copied");
  };

  const reset = () => { setCvText(""); setTargetRole(""); setResult(null); setError(null); setCopied(false); track("reset_clicked"); };
  const progressPct = loading && streamTokens > 0 ? Math.min(95, Math.round((streamTokens / 1000) * 100)) : 0;
  const donCopy = DONATION_COPY[lang] || DONATION_COPY.es;

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-[family-name:var(--font-geist)] text-lg font-medium tracking-tight"><FaviconIcon /><span><span className="text-ink-900">CV</span><span className="text-accent">ool</span></span></span>
          <div className="flex items-center gap-3">
            <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}
              className="text-xs font-medium text-ink-500 bg-transparent border border-ink-100 rounded-lg px-2 py-1 focus:outline-none focus:border-accent cursor-pointer">
              {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
            </select>
            <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-ink-600 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
        <p className="text-[11px] text-ink-300 tracking-wide text-center">{lang === "es" ? "An\u00e1lisis y optimizaci\u00f3n con Claude Sonnet 4.6 \u00b7 Anthropic" : "Analysis & optimization with Claude Sonnet 4.6 \u00b7 Anthropic"}</p>
      </header>

      {/* Hero */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{ui.heroTitle}</h1>
        <p className="text-sm text-accent font-medium">{ui.heroAccent}</p>
        <div className="text-sm text-ink-400 space-y-0.5">
          <p>{ui.heroLine1}</p><p>{ui.heroLine2}</p><p>{ui.heroLine3}</p>
        </div>
      </section>

      {/* Progress */}
      {(loading || parsing) && (
        <div className="text-center py-6 space-y-3" aria-live="polite">
          {parsing ? <p className="text-sm text-ink-400 animate-pulse">{ui.uploadingPdf}</p> : (
            <>
              <div className="relative h-5 analysis-msgs">
                <span className="text-sm text-ink-400">{ui.analyzing1}</span>
                <span className="text-sm text-ink-400">{ui.analyzing2}</span>
                <span className="text-sm text-ink-400">{ui.analyzing3}</span>
                <span className="text-sm text-ink-400">{ui.analyzing4}</span>
              </div>
              {streamTokens > 0 && (
                <div className="max-w-xs mx-auto">
                  <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {/* INPUT FORM */}
      {!result && !loading && !parsing && (
        <section className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="pt-3"><Badge n={1} /></div>
            <div className="flex-1 relative border border-ink-100 rounded-lg focus-within:border-accent transition">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute top-3 right-3 z-10 px-3 py-1 rounded-lg border border-ink-200 text-xs font-medium text-ink-500 hover:border-accent hover:text-accent transition cursor-pointer bg-ink-000">
                {ui.attachPdf}
              </button>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <textarea value={cvText} onChange={(e) => setCvText(e.target.value)} placeholder={ui.placeholder}
                className="w-full min-h-[120px] p-4 pt-12 text-sm text-ink-700 bg-transparent placeholder:text-ink-300 resize-y focus:outline-none rounded-lg" />
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Badge n={2} />
            <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
              placeholder={`${ui.targetRole} ${ui.targetRoleOptional}`} maxLength={200}
              className="flex-1 border border-ink-100 rounded-lg px-4 py-2.5 text-sm text-ink-700 placeholder:text-ink-300 focus:outline-none focus:border-accent transition" />
          </div>
          <div className="flex gap-3 items-center">
            <Badge n={3} />
            <button onClick={analyze} disabled={!ready}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition cursor-pointer active:scale-[0.98] ${ready ? "bg-accent text-white hover:bg-accent-dim" : "bg-ink-100 text-ink-300 cursor-not-allowed"}`}>
              {ui.btnAnalyze}
            </button>
          </div>
          <div className="text-center space-y-0.5 pl-9">
            <p className="text-xs text-ink-300">{ui.privacy}</p>
            <p className="text-xs text-ink-300">{ui.rateLimit}</p>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {result && (
        <div ref={resultsRef} className="space-y-3">
          <p className="text-xs text-accent font-medium">{ui.expandHint}</p>

          {/* Step 1 */}
          <div className="flex gap-3 items-center">
            <Badge n={1} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.originalCvTitle}</summary>
              <div className="px-4 pb-4 text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">{cvText}</div>
            </details>
          </div>

          {/* Step 2 */}
          <div className="flex gap-3 items-center">
            <Badge n={2} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.targetRoleTitle}</summary>
              <p className="px-4 pb-3 text-sm text-ink-500">{targetRole || ui.notSpecified}</p>
            </details>
          </div>

          {/* Step 3 — Analysis */}
          <div className="flex gap-3 items-start">
            <div className="pt-3"><Badge n={3} /></div>
            <details open className="flex-1 border border-ink-100 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 text-sm font-medium text-accent bg-accent-ghost cursor-pointer flex items-center gap-2"><Chevron className="text-accent" />{ui.analysisTitle}</summary>
              <div className="p-4 space-y-4">
                <details open className="border border-ink-100 rounded-lg">
                  <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300" />{ui.scoreSummaryTitle}</summary>
                  <div className="px-4 pb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-[family-name:var(--font-mono)] text-ink-400">{result.score.total}/100</span>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-300 tracking-wide">&mdash; {ui.scoreMeta}</span>
                    </div>
                    <p className="text-sm text-ink-600 leading-relaxed">{result.score.summary}</p>
                  </div>
                </details>
                {result.analysis.strengths.length > 0 && (
                  <details className="border border-positive/20 rounded-lg bg-positive-ghost">
                    <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-positive hint-chevron" />{ui.strengthsTitle}</summary>
                    <div className="px-4 pb-4 space-y-2">
                      {result.analysis.strengths.map((s, i) => (
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
                {result.analysis.improvements.length > 0 && (
                  <details className="border border-ink-100 rounded-lg">
                    <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.improvementsTitle}</summary>
                    <div className="px-4 pb-4 space-y-3">
                      {result.analysis.improvements.map((imp, i) => (
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

          {/* Step 4 — Improved CV */}
          <div className="flex gap-3 items-start">
            <div className="pt-3"><Badge n={4} /></div>
            <details open className="flex-1 border border-accent/30 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 text-sm font-medium text-white bg-accent cursor-pointer flex items-center gap-2"><Chevron className="text-white/70" />{ui.improvedCvTitle}</summary>
              <div className="p-4 space-y-3">
                {result.improved_cv.changes.length > 0 && (
                  <details className="border border-ink-100 rounded-lg">
                    <summary className="px-4 py-3 text-sm font-medium text-ink-600 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.changesTitle}</summary>
                    <ul className="px-4 pb-3 space-y-1">
                      {result.improved_cv.changes.map((c, i) => <li key={i} className="flex gap-2 text-sm text-ink-500"><span className="text-positive shrink-0">+</span>{c}</li>)}
                    </ul>
                  </details>
                )}
                <details open className="border border-accent/30 rounded-lg">
                  <summary className="px-4 py-3 text-sm font-medium text-accent flex items-center gap-2"><Chevron className="text-accent" />{ui.newTextTitle}</summary>
                  <div className="px-4 pb-4 space-y-3">
                    <ResumeText text={result.improved_cv.text} />
                    <button onClick={copy} className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-ink-200 text-sm text-ink-600 hover:border-accent hover:text-accent transition cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copied ? ui.copied : ui.copy}
                    </button>
                  </div>
                </details>
              </div>
            </details>
          </div>

          {/* Donation — subtle, only visible after copy, emotional seed */}
          {copied && (
            <div className="text-center py-4 donation-fade-in">
              <p className="text-xs text-ink-400 mb-1"><CvoolText text={donCopy.line1} /></p>
              <p className="text-xs text-ink-300 mb-2">{donCopy.line2}</p>
              <Link href="/donate" onClick={() => track("donation_clicked")} className="text-xs text-accent hover:text-accent-dim transition font-medium"><CvoolText text={donCopy.cta} /></Link>
            </div>
          )}

          {/* Reset */}
          <div className="text-center">
            <button onClick={reset} className="text-sm text-accent hover:text-accent-dim transition cursor-pointer">{ui.tryAgain}</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-12 pb-6 space-y-4">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1.5 text-xs text-ink-400">
          <Link href="/how" className="hover:text-ink-700 transition">{lang === "es" ? "C\u00f3mo funciona" : "How it works"}</Link>
          <Link href="/about" className="hover:text-ink-700 transition">{lang === "es" ? "Sobre m\u00ed" : "About"}</Link>
          <Link href="/security" className="hover:text-ink-700 transition">{lang === "es" ? "Seguridad" : "Security"}</Link>
          <Link href="/privacy" className="hover:text-ink-700 transition">{lang === "es" ? "Privacidad" : "Privacy"}</Link>
          <Link href="/terms" className="hover:text-ink-700 transition">{lang === "es" ? "T\u00e9rminos" : "Terms"}</Link>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
          <span className="inline-flex items-center gap-1.5 font-medium"><FaviconIcon size="w-4 h-4" /><Cv /></span>
          <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="GitHub">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <a href="https://x.com/maxcvorg" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="X">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")} className="hover:text-ink-600 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 110 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </a>
        </div>
        <p className="text-[11px] text-ink-300 text-center">{ui.footerFree}</p>
      </footer>
    </div>
  );
}
