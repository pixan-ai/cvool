"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { t, dimName } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import type { AnalysisResult } from "@/types/analysis";
import { CvoolBrand as Cv, CvoolText } from "@/components/CvoolBrand";
import { FaviconIcon } from "@/components/FaviconIcon";
import { GitHubIcon } from "@/components/icons";
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

function extractCvMetadata(cv: string) {
  const words = cv.trim().split(/\s+/).filter(Boolean).length;
  const bullets = (cv.match(/^[\s]*[\u2022\u00b7\u2023\-*]/gm) ?? []).length;
  const withMetrics = (cv.match(/\d+\s*%|[$€£]\s*\d|\d+\s*[KMB]\b/g) ?? []).length;
  return { words, bullets, withMetrics };
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
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [streamTokens, setStreamTokens] = useState(0);
  const [streamDone, setStreamDone] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setLang(detectLang()); }, []);

  // Time-based progress ticker. Starts when loading begins, stops on unload.
  // We track elapsed milliseconds rather than computing the percentage here,
  // so the rendering layer can mix it with the token-based signal.
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
    setLoading(true); setError(null); setResult(null); setStreamTokens(0); setStreamDone(false);
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
              else if (currentEvent === "result") {
                const r = parsed as AnalysisResult;
                // Public counter increment (fire-and-forget; runs from the
                // user's browser, not the server, to keep our backend silent
                // toward third parties). Triggered here — not from a window
                // event — because the social-proof component unmounts the
                // moment setResult fires.
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
      await navigator.clipboard.writeText(result.improved_cv.text);
      setCopied(true); setTimeout(() => setCopied(false), 2000);
      track("cv_copied");
    } catch { /* clipboard API unavailable */ }
  };

  const reset = () => { setCvText(""); setTargetRole(""); setResult(null); setError(null); setCopied(false); track("reset_clicked"); };

  // Progress bar logic (see Mejoras_Ux_cvool.pdf v2 + chat May 2 2026):
  //   - Time-based: reaches 80% in 50 seconds. Caps at 80%.
  //   - Token-based: real signal from the SSE stream. Also caps at 80%.
  //   - Whichever is more advanced wins (Math.max). Bar is always moving.
  //   - Only `done: true` from the SSE stream releases the bar to 100%.
  // This kills the "stuck at a quarter" feeling because the timer ticks
  // independently of when Claude starts emitting tokens.
  const timePct = Math.min(80, (elapsedMs / 50000) * 80);
  const tokenPct = streamTokens > 0 ? Math.min(80, (streamTokens / 1000) * 100) : 0;
  const progressPct = streamDone ? 100 : Math.round(Math.max(timePct, tokenPct));

  return (
    <div className="max-w-2xl mx-auto px-5 py-5 space-y-4">
      {/* Header */}
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

      {/* Hero — centered, three lines: title+accent on top, sub with bold, then explainer */}
      <section className="text-center space-y-2 pt-2">
        <h1 className="text-2xl sm:text-[28px] font-medium text-ink-900 tracking-tight leading-tight">
          {ui.heroTitle} <span className="text-accent">{ui.heroAccent}</span>
        </h1>
        <p className="text-sm text-ink-700"><BoldMarkers text={ui.heroSub} /></p>
        <p className="text-sm text-ink-500">{ui.heroExplain}</p>
      </section>

      {/* Progress — time-aware bar + staggered stat reveal */}
      {(loading || parsing) && (
        <div className="text-center py-6 space-y-4" aria-live="polite">
          {parsing ? <p className="text-sm text-ink-400 animate-pulse">{ui.uploadingPdf}</p> : (
            <>
              <p className="text-sm text-ink-400 animate-pulse">
                {progressPct >= 80 ? ui.analyzingAlmostDone : streamTokens > 0 ? ui.analyzingWriting : ui.analyzingReading}
              </p>
              <div className="max-w-xs mx-auto">
                <div className="h-1 bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-300 ease-out" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
              {cvMetadata && (
                <div className="flex justify-center gap-8 tabular-nums pt-1">
                  <div className={`text-center transition-opacity duration-700 ${progressPct >= 20 ? "opacity-100" : "opacity-0"}`}>
                    <div className="text-2xl font-medium text-ink-900">{cvMetadata.words.toLocaleString(lang)}</div>
                    <div className="text-xs text-ink-400 mt-1">{ui.metaWords}</div>
                  </div>
                  <div className={`text-center transition-opacity duration-700 ${progressPct >= 40 ? "opacity-100" : "opacity-0"}`}>
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

      {/* INPUT FORM */}
      {!result && !loading && !parsing && (
        <section className="space-y-3 pt-2">
          {/* Step 1: CV text */}
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

          {/* Step 2: Target role — textarea with two-line placeholder, both lines disappear on type */}
          <div className="flex gap-2 items-start">
            <div className="pt-2"><StepBadge n={2} /></div>
            <div className="flex-1">
              <textarea
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder={`${ui.targetRole}\n${ui.targetRoleHelp}`}
                maxLength={500}
                rows={2}
                aria-label="Target role"
                className="w-full p-3 text-sm text-ink-700 bg-ink-000 border border-ink-100 rounded-lg placeholder:text-ink-300 placeholder:whitespace-pre-line resize-none focus:outline-none focus:border-accent transition"
              />
            </div>
          </div>

          {/* Step 3: Analyze */}
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

      {/* RESULTS */}
      {result && (
        <div ref={resultsRef} className="space-y-3">
          <p className="text-xs text-accent font-medium">{ui.expandHint}</p>

          {/* Original CV */}
          <div className="flex gap-2 items-center">
            <StepBadge n={1} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.originalCvTitle}</summary>
              <div className="px-4 pb-4 text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">{cvText}</div>
            </details>
          </div>

          {/* Target role */}
          <div className="flex gap-2 items-center">
            <StepBadge n={2} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300 hint-chevron" />{ui.targetRoleTitle}</summary>
              <p className="px-4 pb-3 text-sm text-ink-500">{targetRole || ui.notSpecified}</p>
            </details>
          </div>

          {/* Analysis */}
          <div className="flex gap-2 items-center">
            <StepBadge n={3} />
            <details className="flex-1 border border-ink-100 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 text-sm font-medium text-accent bg-accent-ghost cursor-pointer flex items-center gap-2"><Chevron className="text-accent" />{ui.analysisTitle}</summary>
              <div className="p-4 space-y-4">
                <details open className="border border-ink-100 rounded-lg">
                  <summary className="px-4 py-3 text-sm font-medium text-ink-700 flex items-center gap-2"><Chevron className="text-ink-300" />{ui.scoreSummaryTitle}</summary>
                  <div className="px-4 pb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-[family-name:var(--font-mono)] text-ink-400">{result.score.total}/100</span>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-300 tracking-wide">— {ui.scoreMeta}</span>
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

          {/* Improved CV */}
          <div className="flex gap-2 items-start">
            <div className="pt-3"><StepBadge n={4} /></div>
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

          {/* Donation */}
          {copied && (
            <div className="text-center py-4 donation-fade-in">
              <p className="text-xs text-ink-400 mb-1"><CvoolText text={ui.donationLine1} /></p>
              <p className="text-xs text-ink-300 mb-2">{ui.donationLine2}</p>
              <Link href="/donate" onClick={() => track("donation_clicked")} className="text-xs text-accent hover:text-accent-dim transition font-medium"><CvoolText text={ui.donationCta} /></Link>
            </div>
          )}

          {/* Reset */}
          <div className="text-center">
            <button onClick={reset} className="text-sm text-accent hover:text-accent-dim transition cursor-pointer">{ui.tryAgain}</button>
          </div>
        </div>
      )}

      {/* Social proof — centered, no share button */}
      {!result && !loading && !parsing && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <CvsAnalyzedCount lang={lang} />
          <span className="text-[11px] text-ink-400 leading-snug">{ui.socialProofText}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-4 pb-4 space-y-3">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-ink-400">
          <Link href="/how" className="hover:text-ink-700 transition">{ui.footerHow}</Link>
          <Link href="/about" className="hover:text-ink-700 transition">{ui.footerAbout}</Link>
          <Link href="/security" className="hover:text-ink-700 transition">{ui.footerSecurity}</Link>
          <Link href="/privacy" className="hover:text-ink-700 transition">{ui.footerPrivacy}</Link>
          <Link href="/terms" className="hover:text-ink-700 transition">{ui.footerTerms}</Link>
        </div>
        <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
          <span className="inline-flex items-center gap-[2px] font-medium"><FaviconIcon size="w-4 h-4" /><Cv /></span>
          <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="GitHub">
            <GitHubIcon />
          </a>
          <a href="https://x.com/cvoolorg" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition" aria-label="X">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://buymeacoffee.com/cvool" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")} className="hover:text-ink-600 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 110 8h-1" /><path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </a>
        </div>
        <FooterPublicCounters lang={lang} />
      </footer>
    </div>
  );
}
