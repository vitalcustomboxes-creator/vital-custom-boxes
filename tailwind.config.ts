import type { Config } from "tailwindcss";

/**
 * Tailwind 3.4 config (ARCHITECT owns this file).
 *
 * All brand values resolve to CSS variables that DESIGNER defines in
 * styles/tokens.css — Tailwind classes are stable even when token values
 * change. Variable naming contract (see docs/ARCHITECTURE.md):
 *   colors:  --color-<name>-<step>   e.g. --color-ink-900
 *   radius:  --radius-<size>         e.g. --radius-md
 *   shadows: --shadow-<level>        e.g. --shadow-e2
 *   fonts:   --font-display / --font-body (wired to next/font by BE-1/DESIGNER)
 *
 * NOTE: because colors are opaque var() references (hex in tokens.css),
 * Tailwind opacity modifiers like bg-ink-900/50 will NOT work on brand
 * colors. Use dedicated rgba tokens if translucency is needed.
 * Spacing: Tailwind's default scale already matches the 4px grid — no override.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "var(--color-ink-900)",
          700: "var(--color-ink-700)",
          100: "var(--color-ink-100)",
        },
        terra: {
          600: "var(--color-terra-600)",
          500: "var(--color-terra-500)",
          100: "var(--color-terra-100)",
        },
        paper: {
          50: "var(--color-paper-50)",
        },
        kraft: {
          100: "var(--color-kraft-100)",
        },
        // Brand slate (warm navy-gray) intentionally replaces Tailwind's
        // default slate scale — only the steps defined in the design tokens
        // exist, so off-system shades cannot be used by accident.
        slate: {
          600: "var(--color-slate-600)",
          400: "var(--color-slate-400)",
        },
        gold: {
          500: "var(--color-gold-500)",
        },
        success: "var(--color-success)",
        error: "var(--color-error)",
      },
      borderRadius: {
        sm: "var(--radius-sm)", // 6px
        md: "var(--radius-md)", // 10px
        lg: "var(--radius-lg)", // 16px
        // rounded-full keeps the Tailwind default (9999px).
      },
      boxShadow: {
        e1: "var(--shadow-e1)",
        e2: "var(--shadow-e2)",
        e3: "var(--shadow-e3)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Poppins", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Manrope", "system-ui", "sans-serif"],
      },
      transitionTimingFunction: {
        brand: "cubic-bezier(.16,1,.3,1)", // per design brief motion spec
      },
    },
  },
  plugins: [],
};

export default config;
