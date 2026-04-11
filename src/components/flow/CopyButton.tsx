"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { duration, easing, spring } from "@/lib/motion-presets";

interface Props {
  text: string;
  label: string;
  primary?: boolean;
  compact?: boolean;
}

export default function CopyButton({ text, label, primary, compact }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const base =
    "relative inline-flex items-center gap-2 rounded-full font-medium transition-colors";
  const size = compact ? "px-3 py-1 text-xs" : "px-5 py-2.5 text-sm";
  const color = primary
    ? "bg-ink-900 text-white hover:bg-accent"
    : "border border-ink-200 text-ink-700 hover:border-ink-900 hover:text-ink-900";

  return (
    <motion.button
      type="button"
      onClick={copy}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      className={`${base} ${size} ${color}`}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.quick, ease: easing.out }}
            className="flex items-center gap-2"
          >
            <CheckIcon />
            Copiado
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: duration.quick, ease: easing.out }}
            className="flex items-center gap-2"
          >
            <CopyIcon />
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
