import type { Transition, Variants } from "framer-motion";

export const spring = {
  gentle: { type: "spring", stiffness: 200, damping: 28, mass: 0.8 } as const,
  snappy: { type: "spring", stiffness: 320, damping: 28, mass: 0.6 } as const,
  bouncy: { type: "spring", stiffness: 260, damping: 18, mass: 0.9 } as const,
} satisfies Record<string, Transition>;

export const easing = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  expo: [0.87, 0, 0.13, 1] as const,
};

export const duration = {
  instant: 0.12,
  quick: 0.24,
  base: 0.4,
  slow: 0.6,
  cinematic: 1.2,
} as const;

export const screenVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.out },
  },
  exit: {
    opacity: 0,
    y: -24,
    transition: { duration: duration.quick, ease: easing.out },
  },
};

export const stagger = (delay = 0.06): Variants => ({
  enter: {
    transition: { staggerChildren: delay, delayChildren: 0.08 },
  },
});

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easing.out },
  },
};
