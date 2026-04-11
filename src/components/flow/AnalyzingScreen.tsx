"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Phase } from "@/types/ui-state";
import { duration, easing, spring } from "@/lib/motion-presets";
import ScoreRing from "./ScoreRing";
import PhaseList from "./PhaseList";

interface Props {
  phases: Phase[];
  progress: number;
  onCancel: () => void;
}

const MICRO_COPY = [
  "Leyendo estructura y secciones",
  "Evaluando compatibilidad con ATS",
  "Midiendo el impacto de tus logros",
  "Buscando verbos débiles y voz pasiva",
  "Detectando huecos en tu narrativa",
  "Reescribiendo el perfil inicial",
  "Cuantificando resultados",
  "Ajustando tono y concisión",
];

export default function AnalyzingScreen({ phases, progress, onCancel }: Props) {
  const [tick, setTick] = useState(0);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const microCopy = MICRO_COPY[tick % MICRO_COPY.length];

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
      <button
        onClick={() => setConfirmCancel(true)}
        className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-ink-200 px-4 py-2 text-xs text-ink-500 transition hover:border-ink-900 hover:text-ink-900"
        aria-label="Cancelar análisis"
      >
        <span className="text-base leading-none">×</span>
        cancelar
      </button>

      <AnimatePresence>
        {confirmCancel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-6 top-20 z-10 flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 shadow-lg"
          >
            <span className="text-sm text-ink-700">
              ¿Seguro? Perderás el progreso.
            </span>
            <button
              onClick={() => setConfirmCancel(false)}
              className="rounded-full border border-ink-200 px-3 py-1 text-xs"
            >
              seguir
            </button>
            <button
              onClick={onCancel}
              className="rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white"
            >
              cancelar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.gentle}
        className="mb-14"
      >
        <ScoreRing progress={progress} spinning size={200} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: 0.15 }}
        className="text-center font-[family-name:var(--font-instrument)] text-4xl tracking-[-0.02em] md:text-6xl"
      >
        Analizando tu CV…
      </motion.h2>

      <div className="mt-12 w-full max-w-md">
        <PhaseList phases={phases} />
      </div>

      <div className="mt-14 min-h-[3rem] max-w-md text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={microCopy}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: duration.base, ease: easing.out }}
            className="font-[family-name:var(--font-instrument)] text-lg italic text-ink-500 md:text-xl"
          >
            &ldquo;{microCopy}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
