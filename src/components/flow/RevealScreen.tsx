"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import type { AnalysisResult } from "@/types/analysis";
import ScoreRing from "./ScoreRing";
import { duration, easing, spring } from "@/lib/motion-presets";

interface Props {
  result: AnalysisResult;
  onComplete: () => void;
}

export default function RevealScreen({ result, onComplete }: Props) {
  useEffect(() => {
    const id = setTimeout(onComplete, 1700);
    return () => clearTimeout(id);
  }, [onComplete]);

  const total = result.score?.total ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={spring.gentle}
      >
        <ScoreRing progress={total / 100} score={total} size={260} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.base, ease: easing.out, delay: 1.0 }}
        className="mt-10 font-[family-name:var(--font-instrument)] text-2xl italic text-ink-600 md:text-3xl"
      >
        Listo — tu CV mejoró.
      </motion.p>
    </div>
  );
}
