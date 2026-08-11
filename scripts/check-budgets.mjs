#!/usr/bin/env node
/**
 * scripts/check-budgets.mjs — owner: DEVOPS.
 *
 * Enforces the PROJECT_BRIEF quality budget: first-load JS ≤ 150 kB per route
 * (override with BUDGET_KB=…; kB = 1000 bytes, the unit `next build` prints).
 *
 * Run AFTER `npm run build` — CI order: build → check-budgets → smoke
 * (.github/workflows/ci.yml). Without a production build this exits 1 with a
 * clear message instead of a stack trace (a `next dev` .next folder leaves the
 * manifests empty and is detected as "not a build").
 *
 * Accounting (mirrors the "First Load JS" column of `next build` to ~1-2%):
 * for every App Router route (`…/page` entry in .next/app-build-manifest.json)
 * the first-load set = build-manifest.json `rootMainFiles`
 *                    ∪ every ancestor `…/layout` chunk list
 *                    ∪ the page's own chunk list;
 * unique .js files are gzipped (node:zlib defaults) and summed.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const NEXT_DIR = join(ROOT, ".next");
const BUDGET_KB = Number(process.env.BUDGET_KB ?? 150);
const BUDGET_BYTES = BUDGET_KB * 1000;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!existsSync(NEXT_DIR)) {
  fail(
    `[check-budgets] No .next directory found at ${NEXT_DIR}.\n` +
      "[check-budgets] Run `npm run build` first — this check parses production build manifests.",
  );
}

const appManifestPath = join(NEXT_DIR, "app-build-manifest.json");
const buildManifestPath = join(NEXT_DIR, "build-manifest.json");
if (!existsSync(appManifestPath) || !existsSync(buildManifestPath)) {
  fail(
    "[check-budgets] Build manifests are missing from .next/.\n" +
      "[check-budgets] Run `npm run build` first (a dev-server .next folder is not a production build).",
  );
}

const appManifest = JSON.parse(readFileSync(appManifestPath, "utf8"));
const buildManifest = JSON.parse(readFileSync(buildManifestPath, "utf8"));
const pages = appManifest.pages ?? {};
const rootMainFiles = buildManifest.rootMainFiles ?? [];
const pageKeys = Object.keys(pages).filter((key) => key.endsWith("/page"));

if (pageKeys.length === 0 || rootMainFiles.length === 0) {
  fail(
    "[check-budgets] Manifests are empty — this .next looks like `next dev` output, not a production build.\n" +
      "[check-budgets] Run `npm run build`, then `node scripts/check-budgets.mjs`.",
  );
}

/* ----------------------------- size helpers ------------------------------ */

const gzCache = new Map();
let staleWarnings = 0;
function gzipSizeOf(file) {
  if (!gzCache.has(file)) {
    const abs = join(NEXT_DIR, file);
    if (!existsSync(abs)) {
      console.warn(
        `[check-budgets] warn: manifest references missing chunk ${file} — counted as 0 (stale/partial build?)`,
      );
      staleWarnings += 1;
      gzCache.set(file, 0);
    } else {
      gzCache.set(file, gzipSync(readFileSync(abs)).length);
    }
  }
  return gzCache.get(file);
}

/** Unique first-load JS chunks for an app-manifest page key (see header). */
function firstLoadFiles(pageKey) {
  const files = new Set(rootMainFiles);
  const segments = pageKey.slice(0, -"/page".length).split("/").filter(Boolean);
  for (let depth = 0; depth <= segments.length; depth += 1) {
    const layoutKey = `/${[...segments.slice(0, depth), "layout"].join("/")}`;
    for (const file of pages[layoutKey] ?? []) files.add(file);
  }
  for (const file of pages[pageKey] ?? []) files.add(file);
  return [...files].filter((file) => file.endsWith(".js"));
}

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} kB`;

/* --------------------------------- report -------------------------------- */

const sharedBytes = rootMainFiles
  .filter((file) => file.endsWith(".js"))
  .reduce((sum, file) => sum + gzipSizeOf(file), 0);

const rows = pageKeys
  .map((pageKey) => {
    const route = pageKey.slice(0, -"/page".length) || "/";
    const bytes = firstLoadFiles(pageKey).reduce(
      (sum, file) => sum + gzipSizeOf(file),
      0,
    );
    return { route, bytes, over: bytes > BUDGET_BYTES };
  })
  .sort((a, b) => b.bytes - a.bytes);

const routeWidth = Math.max(...rows.map((row) => row.route.length), "route".length);
console.log(
  `\n[check-budgets] First-load JS budget: ${BUDGET_KB} kB/route (gzip) · shared baseline ${kb(sharedBytes)} · ${rows.length} route(s)\n`,
);
console.log(`  ${"route".padEnd(routeWidth)}  ${"first-load".padStart(12)}  status`);
console.log(`  ${"-".repeat(routeWidth)}  ${"-".repeat(12)}  ------`);
for (const row of rows) {
  console.log(
    `  ${row.route.padEnd(routeWidth)}  ${kb(row.bytes).padStart(12)}  ${row.over ? "OVER" : "ok"}`,
  );
}

const over = rows.filter((row) => row.over);
if (over.length > 0) {
  console.error(
    `\n[check-budgets] FAIL — ${over.length}/${rows.length} route(s) exceed ${BUDGET_KB} kB: ${over
      .map((row) => row.route)
      .join(", ")}`,
  );
  process.exit(1);
}
console.log(
  `\n[check-budgets] PASS — all ${rows.length} route(s) within ${BUDGET_KB} kB${
    staleWarnings > 0 ? ` (${staleWarnings} missing-chunk warning(s) — rebuild to be sure)` : ""
  }\n`,
);
