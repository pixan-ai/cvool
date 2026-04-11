"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Phase } from "@/types/ui-state";
import { easing } from "@/lib/motion-presets";

interface Props {
  phases: Phase[];
}

function formatElapsed(startedAt?: number, completedAt?: number, now?: number) {
  if (!startedAt) return "";
  const end = completedAt ?? now ?? Date.now();
  const s = Math.max(0, Math.round((end - startedAt) / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function PhaseList({ phases }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <ul
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Progreso del análisis"
    >
      {phases.map((phase) => (
        <li
          key={phase.id}
          className="flex items-center justify-between font-[family-name:var(--font-mono)] text-sm"
        >
          <span className="flex items-center gap-3">
            <Dot status={phase.status} />
            <span
              className={
                phase.status === "done"
                  ? "text-ink-400 line-through decoration-ink-200"
                  : phase.status === "active"
                    ? "text-ink-900"
                    : "text-ink-300"
              }
            >
              {phase.label}
            </span>
          </span>
          <span className="text-[11px] uppercase tracking-wider text-ink-400">
            {phase.status === "active"
              ? formatElapsed(phase.startedAt, undefined, now)
              : phase.status === "done"
                ? formatElapsed(phase.startedAt, phase.completedAt)
                : "—"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Dot({ status }: { status: Phase["status"] }) {
  if (status === "done") {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25, ease: easing.out }}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-positive text-[10px] text-white"
      >
        ✓
      </motion.span>
    );
  }
  if (status === "active") {
    return (
      <span className="relative flex h-4 w-4 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-block h-2 w-2 rounded-full bg-accent" />
      </span>
    );
  }
  return <span className="inline-block h-4 w-4 rounded-full border border-ink-200" />;
}
