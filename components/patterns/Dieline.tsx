/**
 * components/patterns/Dieline.tsx — public/dieline.svg inlined as JSX so the
 * `.draw-in` stroke animation can run (an external <img> cannot animate).
 * Owner: FE-2 (artwork by DESIGNER — keep geometry in sync with the file).
 *
 * - `draw` → adds `.draw-in` (home hero ONLY; ~1.2s one-time signature).
 * - default (static) → decorative corner art, e.g. CTABand (§6.15).
 * - Always decorative: aria-hidden. Color via wrapper/own text-* class
 *   (currentColor strokes): text-ink-700 on light, text-terra-100/ink-100
 *   inside .dark-section.
 */

export interface DielineProps {
  /** Run the one-time draw-in stroke animation (home hero only). */
  draw?: boolean;
  className?: string;
}

export function Dieline({ draw = false, className }: DielineProps) {
  const classes = [draw ? 'draw-in' : null, className].filter(Boolean).join(' ');
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={classes || undefined}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cut outline: one continuous path — base, side flaps, tuck flaps.
          NOTE: ids from public/dieline.svg are intentionally dropped — this
          component can render more than once per page (hero + CTABand) and
          duplicate ids are invalid HTML. CSS targets classes only. */}
      <path
        pathLength={100}
        d="M160 120 L160 48 L168 48 L176 20 L304 20 L312 48 L320 48 L320 120 L384 132 L384 228 L320 240 L320 312 L312 312 L304 340 L176 340 L168 312 L160 312 L160 240 L96 228 L96 132 Z"
      />
      {/* Thumb notch on the top tuck flap (draws slightly later) */}
      <path
        className="draw-delay-2"
        pathLength={100}
        d="M226 20 A 14 14 0 0 0 254 20"
      />
      {/* Fold lines (dashed) — fade in late; excluded from draw-in */}
      <g
        className="fold-lines"
        strokeDasharray="5 7"
        strokeOpacity={0.5}
        strokeWidth={1.5}
      >
        <path className="fold" d="M160 120 L320 120" />
        <path className="fold" d="M160 240 L320 240" />
        <path className="fold" d="M160 120 L160 240" />
        <path className="fold" d="M320 120 L320 240" />
        <path className="fold" d="M168 48 L312 48" />
        <path className="fold" d="M168 312 L312 312" />
      </g>
    </svg>
  );
}
