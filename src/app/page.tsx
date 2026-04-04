"use client";

import { useState, useRef, useCallback } from "react";
import { track } from "@vercel/analytics";
import { t, dimName } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import type { AnalysisResult } from "@/types/analysis";

const LANGS: Lang[] = ["es", "en", "fr", "pt", "it"];

function Badge({ n }: { n: number }) {
  return (
    <span className="shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-medium flex items-center justify-center">
      {n}
    </span>
  );
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
      if (data.text?.trim().length > 10) {
        setCvText(data.text);
        track("pdf_parsed", { chars: data.text.length });
      } else { setError(ui.errorPdf); }
    } catch { setError(ui.errorPdf); } finally { setParsing(false); }
  }, [ui.errorPdf]);

  const analyze = async () => {
    if (!ready) return;
    setLoading(true); setError(null); setResult(null);
    track("analysis_started", { has_role: targetRole.trim().length > 0 });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvText, targetRole: targetRole || undefined }),
      });
      if (res.status === 429) { setError(ui.errorLimit); return; }
      if (res.status === 403) { setError(ui.errorGeneric); return; }
      if (!res.ok) {
        // Try to get specific error from server
        try {
          const errData = await res.json();
          if (errData.error === "parse_error") {
            setError(ui.errorRetry || ui.errorGeneric);
          } else {
            setError(ui.errorGeneric);
          }
        } catch {
          setError(ui.errorGeneric);
        }
        return;
      }
      let data: AnalysisResult;
      try {
        data = await res.json();
      } catch {
        setError(ui.errorRetry || ui.errorGeneric);
        return;
      }
      setResult(data);
      track("analysis_completed", { score: data.score.total, lang: data.detected_language });
      const dl = data.detected_language as Lang;
      if (LANGS.includes(dl)) setLang(dl);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch { setError(ui.errorConnection); } finally { setLoading(false); }
  };

  const copy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.improved_cv.text);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    track("cv_copied");
  };

  const reset = () => {
    setCvText(""); setTargetRole(""); setResult(null); setError(null); setCopied(false);
    track("reset_clicked");
  };

  const renderResume = (text: string) =>
    text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-3" />;
      const isBullet = /^[•·‣-]\s/.test(trimmed);
      const isHeader = /^[A-ZÁÀÂÃÇÉÈÊËÍÎÏÓÔÕÚÙÛÜÝŸŒÆÑ\s&/]+$/.test(trimmed) && trimmed.length > 2;
      if (isHeader) return <p key={i} className="font-medium text-ink-900 mt-4 mb-1 tracking-wide text-xs uppercase">{trimmed}</p>;
      if (isBullet) return <p key={i} className="pl-5 -indent-3 text-sm text-ink-600 leading-relaxed">{trimmed}</p>;
      return <p key={i} className="text-sm text-ink-600 leading-relaxed">{trimmed}</p>;
    });

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-geist)] text-lg font-medium tracking-tight">
          <span className="text-ink-900">cv</span><span className="text-accent">ool</span>
        </span>
        <div className="flex items-center gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="text-xs font-medium text-ink-500 bg-transparent border border-ink-100 rounded-lg px-2 py-1 focus:outline-none focus:border-accent cursor-pointer"
          >
            {LANGS.map((l) => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
          <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="text-ink-400 hover:text-ink-600 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.82.58A12.01 12.01 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center space-y-2">
        <h1 className="text-2xl font-medium text-ink-900 tracking-tight">{ui.heroTitle}</h1>
        <p className="text-sm text-accent font-medium">{ui.heroAccent}</p>
        <div className="text-sm text-ink-400 space-y-0.5">
          <p>{ui.heroLine1}</p>
          <p>{ui.heroLine2}</p>
          <p>{ui.heroLine3}</p>
        </div>
      </section>

      {/* Progress */}
      {(loading || parsing) && (
        <div className="text-center py-6" aria-live="polite">
          {parsing ? (
            <p className="text-sm text-ink-400 animate-pulse">{ui.uploadingPdf}</p>
          ) : (
            <div className="relative h-5 analysis-msgs">
              <span className="text-sm text-ink-400">{ui.analyzing1}</span>
              <span className="text-sm text-ink-400">{ui.analyzing2}</span>
              <span className="text-sm text-ink-400">{ui.analyzing3}</span>
              <span className="text-sm text-ink-400">{ui.analyzing4}</span>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-center text-sm text-red-600">{error}</p>}

      {/* ── INPUT FORM ── */}
      {!result && !loading && !parsing && (
        <section className="space-y-4">
          <div className="flex gap-3 items-start">
            <div className="pt-3"><Badge n={1} /></div>
            <div className="flex-1 relative border border-ink-100 rounded-lg focus-within:border-accent transition">
              <button type="button" onClick={() => fileRef.current?.click()}
                className="absolute top-3 right-3 z-10 px-3 py-1 rounded-lg border border-ink-200 text-xs font-medium text-ink-500 hover:border-accent hover:text-accent transition cursor-pointer bg-ink-000">
                {ui.attachPdf}
              </button>
              <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              <textarea value={cvText} onChange={(e) => setCvText(e.target.value)}
                placeholder={ui.placeholder}
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

      {/* ── RESULTS ── */}
      {result && (
        <div ref={resultsRef} className="space-y-3">
          <p className="text-xs text-accent font-medium">{ui.expandHint}</p>

          {/* Step 1 — Original CV (collapsed) */}
          <div className="flex gap-3 items-center">
            <Badge n={1} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700">{ui.originalCvTitle}</summary>
              <div className="px-4 pb-4 text-sm text-ink-500 whitespace-pre-wrap max-h-60 overflow-y-auto">{cvText}</div>
            </details>
          </div>

          {/* Step 2 — Target role (collapsed) */}
          <div className="flex gap-3 items-center">
            <Badge n={2} />
            <details className="flex-1 border border-ink-100 rounded-lg">
              <summary className="px-4 py-3 text-sm font-medium text-ink-700">{ui.targetRoleTitle}</summary>
              <p className="px-4 pb-3 text-sm text-ink-500">{targetRole || ui.notSpecified}</p>
            </details>
          </div>

          {/* Step 3 — Analysis (open, dark header) */}
          <div className="flex gap-3 items-start">
            <div className="pt-3"><Badge n={3} /></div>
            <details open className="flex-1 border border-ink-100 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 text-sm font-medium text-white bg-ink-900 cursor-pointer">{ui.analysisTitle}</summary>
              <div className="p-4 space-y-4">
                {/* Score + Summary */}
                <details open className="border border-ink-100 rounded-lg">
                  <summary className="px-4 py-3 text-sm font-medium text-ink-700">{ui.scoreSummaryTitle}</summary>
                  <div className="px-4 pb-4">
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="font-[family-name:var(--font-mono)] text-ink-400">{result.score.total}/100</span>
                      <span className="font-[family-name:var(--font-mono)] text-[11px] text-ink-300 tracking-wide">&mdash; {ui.scoreMeta}</span>
                    </div>
                    <p className="text-sm text-ink-600 leading-relaxed">{result.score.summary}</p>
                  </div>
                </details>

                {/* Strengths (collapsed) */}
                {result.analysis.strengths.length > 0 && (
                  <details className="border border-positive/20 rounded-lg bg-positive-ghost">
                    <summary className="px-4 py-3 text-sm font-medium text-ink-700">{ui.strengthsTitle}</summary>
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

                {/* Improvements (collapsed) */}
                {result.analysis.improvements.length > 0 && (
                  <details className="border border-ink-100 rounded-lg">
                    <summary className="px-4 py-3 text-sm font-medium text-ink-700">{ui.improvementsTitle}</summary>
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

          {/* Step 4 — Improved CV (open, dark header) */}
          <div className="flex gap-3 items-start">
            <div className="pt-3"><Badge n={4} /></div>
            <details open className="flex-1 border border-ink-100 rounded-lg overflow-hidden">
              <summary className="px-4 py-3 text-sm font-medium text-white bg-ink-900 cursor-pointer">{ui.improvedCvTitle}</summary>
              <div className="p-4 space-y-3">
                {/* Changes applied */}
                {result.improved_cv.changes.length > 0 && (
                  <details className="border border-ink-100 rounded-lg">
                    <summary className="px-4 py-3 text-sm font-medium text-ink-600">{ui.changesTitle}</summary>
                    <ul className="px-4 pb-3 space-y-1">
                      {result.improved_cv.changes.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-ink-500"><span className="text-positive shrink-0">+</span>{c}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {/* New text with accent border */}
                <details open className="border border-accent/30 rounded-lg">
                  <summary className="px-4 py-3 text-sm font-medium text-accent">{ui.newTextTitle}</summary>
                  <div className="px-4 pb-4 space-y-3">
                    <div>{renderResume(result.improved_cv.text)}</div>
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
          <div className="text-center border border-ink-100 rounded-lg p-6">
            <p className="text-sm text-ink-500 mb-3">{ui.donationText}</p>
            <a href="https://buymeacoffee.com/alfredoarenas" target="_blank" rel="noopener noreferrer"
              onClick={() => track("donation_clicked")}
              className="inline-block bg-accent text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-accent-dim transition">
              {ui.donationBtn}
            </a>
          </div>

          {/* Reset */}
          <div className="text-center">
            <button onClick={reset} className="text-sm text-accent hover:text-accent-dim transition cursor-pointer">{ui.tryAgain}</button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="pt-12 pb-6 text-center space-y-2">
        <div className="flex items-center justify-center gap-4 text-xs text-ink-400">
          <span className="font-medium"><span className="text-ink-700">cv</span><span className="text-accent">ool</span></span>
          <a href="https://github.com/pixan-ai/cvool" target="_blank" rel="noopener noreferrer" className="hover:text-ink-600 transition">GitHub</a>
          <a href="https://buymeacoffee.com/alfredoarenas" target="_blank" rel="noopener noreferrer" onClick={() => track("donation_clicked")} className="hover:text-ink-600 transition">{ui.donationBtn}</a>
        </div>
        <p className="text-[11px] text-ink-300">{ui.footerFree}</p>
      </footer>
    </div>
  );
}
