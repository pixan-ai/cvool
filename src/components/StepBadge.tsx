// Step badge — just the number, bold in accent color, no surrounding shape.
// Per design iteration: the SVG teardrop wrapper was dropped in favor of
// a clean numeral. Fixed width (w-7) keeps the inputs aligned vertically
// regardless of digit count (1, 2, 3, 4 all share a 28px column).

export function StepBadge({ n }: { n: number }) {
  return (
    <span
      aria-hidden="true"
      className="shrink-0 inline-flex items-center justify-center w-7 text-accent font-medium text-base tabular-nums leading-none"
    >
      {n}
    </span>
  );
}
