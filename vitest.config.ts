/**
 * vitest.config.ts — owner: DEVOPS.
 * History: first cut by BE-3 (node-only, server-only stub + @ alias) — both
 * preserved below; extended same-day by DEVOPS into a two-project setup so
 * FE component tests (jsdom + Testing Library) and BE action/lib tests (node)
 * run from one `vitest run`. Vitest 4 removed `environmentMatchGlobs`, hence
 * `test.projects`.
 *
 * Conventions for test authors (QA-AUTO / FE-* / BE-*):
 *   - `*.test.ts`     → "node" project (server actions, lib/, scripts)
 *   - `*.test.tsx`    → "dom" project (jsdom; tests/setup.ts registers
 *                       @testing-library/jest-dom matchers)
 *   - `*.dom.test.ts` → escape hatch: a .ts test that needs jsdom + setup
 *     (a `// @vitest-environment jsdom` docblock also still works inside the
 *     node project, but it skips tests/setup.ts — prefer the names above)
 *   - import `describe/it/expect` from "vitest" explicitly: `globals: true`
 *     exists for runtime niceties (Testing Library auto-cleanup hooks into the
 *     global afterEach), but tsconfig does not load vitest/globals types, so
 *     bare globals would fail `npm run typecheck`.
 *   - `lib/content.ts` / `lib/seo.ts` import the `server-only` guard; the
 *     alias below stubs it so tests can import them directly (BE-3).
 */
import path from "node:path";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // `server-only` throws outside React Server environments — inert in tests.
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
      // Mirror tsconfig's `@/*` → repo root (exact-prefix match, so scoped
      // packages like @testing-library/* are unaffected).
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    globals: true,
    // Keeps direct `npx vitest run` green while suites are still landing
    // (`npm test` passes the flag explicitly too — ARCHITECT).
    passWithNoTests: true,
    projects: [
      {
        extends: true, // inherit root plugins + aliases
        test: {
          name: "node",
          environment: "node",
          include: [
            "tests/**/*.test.ts",
            "lib/**/*.test.ts",
            "app/**/*.test.ts",
            "scripts/**/*.test.ts",
          ],
          exclude: [...configDefaults.exclude, "**/*.dom.test.ts"],
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          setupFiles: ["./tests/setup.ts"],
          include: [
            "tests/**/*.test.tsx",
            "tests/**/*.dom.test.ts",
            "components/**/*.test.tsx",
            "app/**/*.test.tsx",
          ],
          exclude: [...configDefaults.exclude],
        },
      },
    ],
  },
});
