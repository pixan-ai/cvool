"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface Props {
  progress: number;
  spinning?: boolean;
  score?: number;
  size?: number;
}

export default function ScoreRing({
  progress,
  spinning = false,
  score,
  size = 200,
}: Props) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const target = useMotionValue(0);
  const spring = useSpring(target, { stiffness: 120, damping: 30 });
  const dashOffset = useTransform(spring, (v) => circumference * (1 - v));

  useEffect(() => {
    target.set(Math.max(0, Math.min(1, progress)));
  }, [progress, target]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        animate={spinning ? { rotate: 360 } : { rotate: 0 }}
        transition={
          spinning
            ? { repeat: Infinity, duration: 18, ease: "linear" }
            : { duration: 0.4 }
        }
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-ink-100"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-accent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: dashOffset }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </motion.svg>

      {typeof score === "number" && !spinning && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <CountUp to={score} />
          <span className="mt-1 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-ink-400">
            / 100
          </span>
        </div>
      )}
    </div>
  );
}

function CountUp({ to, duration = 0.9 }: { to: number; duration?: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));

  useEffect(() => {
    const controls = { raf: 0, start: 0 };
    const step = (ts: number) => {
      if (!controls.start) controls.start = ts;
      const t = Math.min(1, (ts - controls.start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 4);
      mv.set(to * eased);
      if (t < 1) controls.raf = requestAnimationFrame(step);
    };
    controls.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(controls.raf);
  }, [to, duration, mv]);

  return (
    <motion.span className="font-[family-name:var(--font-instrument)] text-6xl leading-none tracking-[-0.04em] text-ink-900 md:text-7xl">
      {rounded}
    </motion.span>
  );
}
