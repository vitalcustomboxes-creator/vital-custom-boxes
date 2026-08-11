// eslint.config.mjs — ESLint 9 flat config. Owner: DEVOPS (ISSUES #16).
//
// eslint-config-next@15 still ships eslintrc-style shareable configs, so they
// are bridged with FlatCompat from @eslint/eslintrc (explicit devDependency).
// This mirrors exactly what create-next-app generates for Next 15 + ESLint 9.
//
// `npm run lint` runs `eslint .` directly — `next lint` is deprecated in
// Next 15.5 and removed in Next 16 (script change noted in docs/team/ISSUES.md).
//
// Policy: errors must be REAL (bugs, broken hooks, Core Web Vitals
// violations). Style-level rules from the presets surface as warnings
// (e.g. @typescript-eslint/no-unused-vars is "warn" in next/typescript) so
// parallel feature work in Wave 2 is never blocked by cosmetics.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
});

const eslintConfig = [
  // Global ignores. NOTE: this object must contain ONLY `ignores` — adding any
  // other key turns it into a scoped config and the ignores stop being global.
  {
    ignores: [
      ".next/**",
      ".next-dev/**",
      "node_modules/**",
      "out/**",
      "coverage/**",
      "next-env.d.ts",
      // generated/static assets and runtime data — nothing lintable inside
      "public/**",
      "data/**",
    ],
  },

  // Next.js base + Core Web Vitals rules, then the TypeScript preset
  // (plugin:@typescript-eslint/recommended with unused-vars/expressions
  // downgraded to warnings by eslint-config-next).
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
