// Step badge — pleca with rounded edge on the right and tapered point on the left.
// Used to number the input steps and result sections. Replaces the prior round badge.
// SVG path is hand-tuned to match the design mockup (drop-shape pointing left, with
// the step number in the wide rounded portion).

export function StepBadge({ n }: { n: number }) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center w-12 h-7" aria-hidden="true">
      <svg
        viewBox="0 0 48 28"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded rectangle on the right with tapered teardrop on the left */}
        <path
          d="M 6 14 Q 6 8, 14 6 L 42 6 Q 46 6, 46 10 L 46 18 Q 46 22, 42 22 L 14 22 Q 6 20, 6 14 Z"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.18"
          strokeWidth="1"
        />
      </svg>
      <span className="relative font-medium text-accent text-[13px] tabular-nums leading-none ml-1.5">{n}</span>
    </span>
  );
}
