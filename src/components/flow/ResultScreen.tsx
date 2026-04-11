"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";
import type { ResultTab } from "@/types/ui-state";
import ScoreRing from "./ScoreRing";
import CopyButton from "./CopyButton";
import { duration, easing, fadeUp, stagger } from "@/lib/motion-presets";

interface Props {
  result: AnalysisResult;
  originalText: string;
  activeTab: ResultTab;
  onTab: (tab: ResultTab) => void;
  onReset: () => void;
}

const TABS: { id: ResultTab; label: string }[] = [
  { id: "diagnosis", label: "Diagnóstico" },
  { id: "rewrite", label: "CV reescrito" },
  { id: "diff", label: "Cambios" },
];

export default function ResultScreen({
  result,
  originalText,
  activeTab,
  onTab,
  onReset,
}: Props) {
  const total = result.score?.total ?? 0;
  const summary = result.score?.summary ?? "Tu CV tiene margen de mejora.";

  return (
    <div className="relative mx-auto max-w-4xl px-6 pb-40 pt-14 md:pt-20">
      <motion.header
        variants={stagger(0.06)}
        initial="initial"
        animate="enter"
        className="flex flex-col gap-8 border-b border-ink-100 pb-10 md:flex-row md:items-center md:gap-12"
      >
        <motion.div variants={fadeUp}>
          <ScoreRing progress={total / 100} score={total} size={160} />
        </motion.div>
        <motion.div variants={fadeUp} className="flex-1">
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Tu score
          </div>
          <p className="mt-3 font-[family-name:var(--font-instrument)] text-3xl leading-tight tracking-[-0.02em] md:text-4xl">
            {summary}
          </p>
          <p className="mt-4 text-ink-600">
            Revisa el diagnóstico completo o salta directo al CV reescrito.
          </p>
        </motion.div>
      </motion.header>

      <nav className="mt-10 flex gap-1 overflow-x-auto border-b border-ink-100">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className="relative px-4 py-3 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900 data-[active=true]:text-ink-900"
            data-active={activeTab === t.id}
          >
            {t.label}
            {activeTab === t.id && (
              <motion.span
                layoutId="tab-underline"
                className="absolute inset-x-2 bottom-0 h-[2px] bg-accent"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
          </button>
        ))}
      </nav>

      <AnimatePresence mode="wait">
        <motion.section
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: duration.base, ease: easing.out }}
          className="py-10"
        >
          {activeTab === "diagnosis" && <DiagnosisTab result={result} />}
          {activeTab === "rewrite" && <RewriteTab result={result} />}
          {activeTab === "diff" && (
            <DiffTab originalText={originalText} result={result} />
          )}
        </motion.section>
      </AnimatePresence>

      <StickyFooter result={result} onReset={onReset} />
    </div>
  );
}

function DiagnosisTab({ result }: { result: AnalysisResult }) {
  const strengths = result.analysis?.strengths ?? [];
  const improvements = result.analysis?.improvements ?? [];

  return (
    <div className="space-y-14">
      <section>
        <h3 className="mb-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
          Fortalezas ({strengths.length})
        </h3>
        <ul className="space-y-3">
          {strengths.map((s, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-xl bg-positive-ghost p-4 text-ink-800"
            >
              <span className="mt-1 text-positive">▸</span>
              <div className="flex-1">
                <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-positive">
                  {s.dimension} · {s.dimension_score}/100
                </div>
                <p className="mt-1">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
          Mejoras accionables ({improvements.length})
        </h3>
        <div className="space-y-4">
          {improvements.map((imp, i) => (
            <details
              key={i}
              className="group rounded-xl border border-ink-100 bg-white open:bg-ink-050"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
                <div>
                  <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-accent">
                    {String(i + 1).padStart(2, "0")} · {imp.dimension} ·{" "}
                    {imp.dimension_score}/100
                  </div>
                  <h4 className="mt-2 text-base font-medium text-ink-900">
                    {imp.issue}
                  </h4>
                </div>
                <span className="font-[family-name:var(--font-mono)] text-xs text-ink-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="space-y-4 border-t border-ink-100 px-5 pb-5 pt-4 text-sm">
                {imp.before && (
                  <div>
                    <div className="mb-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-ink-500">
                      Antes
                    </div>
                    <p className="rounded-md bg-ink-050 p-3 text-ink-700">
                      {imp.before}
                    </p>
                  </div>
                )}
                {imp.after && (
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-positive">
                        Después
                      </span>
                      <CopyButton
                        text={imp.after}
                        label="copiar ejemplo"
                        compact
                      />
                    </div>
                    <p className="rounded-md bg-positive-ghost p-3 text-ink-800">
                      {imp.after}
                    </p>
                  </div>
                )}
                <p className="text-ink-600">
                  <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-ink-400">
                    sugerencia ·{" "}
                  </span>
                  {imp.suggestion}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function RewriteTab({ result }: { result: AnalysisResult }) {
  const text = result.improved_cv?.text ?? "";
  const changes = result.improved_cv?.changes ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
          Tu CV reescrito
        </h3>
        <CopyButton text={text} label="copiar todo" />
      </div>
      <pre className="whitespace-pre-wrap rounded-2xl border border-ink-100 bg-ink-050 p-6 font-[family-name:var(--font-geist)] text-[15px] leading-relaxed text-ink-900">
        {text}
      </pre>
      {changes.length > 0 && (
        <div className="mt-8">
          <h4 className="mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
            Cambios aplicados ({changes.length})
          </h4>
          <ul className="space-y-2">
            {changes.map((c, i) => (
              <li key={i} className="flex gap-3 text-sm text-ink-700">
                <span className="text-accent">·</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function DiffTab({
  originalText,
  result,
}: {
  originalText: string;
  result: AnalysisResult;
}) {
  const after = result.improved_cv?.text ?? "";
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-500">
          Antes
        </h3>
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-ink-100 bg-ink-050 p-5 font-[family-name:var(--font-geist)] text-sm leading-relaxed text-ink-600">
          {originalText || "—"}
        </pre>
      </div>
      <div>
        <h3 className="mb-3 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-positive">
          Después
        </h3>
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-2xl border border-ink-100 bg-positive-ghost p-5 font-[family-name:var(--font-geist)] text-sm leading-relaxed text-ink-900">
          {after}
        </pre>
      </div>
    </div>
  );
}

function StickyFooter({
  result,
  onReset,
}: {
  result: AnalysisResult;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...fadeUp.enter, delay: 0.2 }}
      className="fixed inset-x-0 bottom-0 z-20 border-t border-ink-100 bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <button
          onClick={onReset}
          className="text-sm text-ink-500 transition-colors hover:text-ink-900"
        >
          ← Analizar otro
        </button>
        <CopyButton
          text={result.improved_cv?.text ?? ""}
          label="Copiar CV mejorado"
          primary
        />
      </div>
    </motion.div>
  );
}
