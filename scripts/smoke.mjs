#!/usr/bin/env node
/**
 * scripts/smoke.mjs — owner: DEVOPS.
 *
 * Self-contained one-shot smoke test (sandbox-safe: every bash call is
 * independent, so this script boots the server, tests, and tears down within
 * a single invocation — nothing is left running).
 *
 *   1. boots the site on SMOKE_PORT (default 3100) via `next start` when a
 *      production build exists (.next/BUILD_ID + prerender-manifest.json),
 *      else falls back to `next dev` (slower — compiles per request); force
 *      with SMOKE_MODE=start|dev. CI runs this AFTER `npm run build` in the
 *      SAME job so the build artifacts are present (.github/workflows/ci.yml).
 *   2. fetches the canonical route list below and asserts:
 *        - expected HTTP status (200s, plus a deliberate 404 probe)
 *        - every 200 page has EXACTLY ONE <h1 (audit rule: single H1)
 *        - every 200 page has a non-empty <title>
 *   3. prints a pass/fail table, kills the whole server process group, exits
 *      0 only if every row passed.
 */
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.SMOKE_PORT ?? 3100);
const BASE = `http://127.0.0.1:${PORT}`;

/** Canonical smoke routes (trailing slashes — next.config has trailingSlash). */
const ROUTES = [
  { path: "/", expect: 200 },
  { path: "/shop/custom-bakery-boxes/", expect: 200 },
  { path: "/shop/custom-bakery-boxes/custom-cake-boxes/", expect: 200 },
  { path: "/get-custom-quote/", expect: 200 },
  { path: "/reviews/", expect: 200 },
  { path: "/blog/", expect: 200 },
  {
    path: "/custom-bakery-boxes/",
    expect: 308,
    location: "/shop/custom-bakery-boxes/",
  },
  {
    path: "/products/custom-cake-boxes/",
    expect: 308,
    location: "/shop/custom-bakery-boxes/custom-cake-boxes/",
  },
  { path: "/products/", expect: 308, location: "/shop/" },
  { path: "/case-studies/", expect: 308, location: "/portfolio/" },
  { path: "/no-such-page-smoke-probe/", expect: 404 },
];

const hasBuild =
  existsSync(join(ROOT, ".next", "BUILD_ID")) &&
  existsSync(join(ROOT, ".next", "prerender-manifest.json"));
const MODE = process.env.SMOKE_MODE ?? (hasBuild ? "start" : "dev");
const READY_TIMEOUT_MS = MODE === "dev" ? 90_000 : 30_000;
const FETCH_TIMEOUT_MS = MODE === "dev" ? 45_000 : 15_000;

if (MODE === "dev") {
  console.warn(
    "[smoke] No production build found — falling back to `next dev` (slow, compiles per request).\n" +
      "[smoke] Prefer: npm run build && node scripts/smoke.mjs",
  );
}

/* ------------------------------ server boot ------------------------------ */

const nextBin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
// detached → own process group, so the whole tree can be killed at the end.
const child = spawn(process.execPath, [nextBin, MODE, "-p", String(PORT)], {
  cwd: ROOT,
  detached: true,
  stdio: ["ignore", "pipe", "pipe"],
});

let serverOutput = "";
const capture = (chunk) => {
  serverOutput = (serverOutput + chunk.toString()).slice(-4000);
};
child.stdout.on("data", capture);
child.stderr.on("data", capture);

let childExited = false;
child.on("exit", () => {
  childExited = true;
});

async function killServer() {
  try {
    process.kill(-child.pid, "SIGTERM"); // negative pid = whole process group
  } catch {
    /* already gone */
  }
  const grace = Date.now() + 1_500;
  while (!childExited && Date.now() < grace) {
    await sleep(100);
  }
  if (!childExited) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      /* already gone */
    }
  }
}

async function waitForServer() {
  const deadline = Date.now() + READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (childExited) {
      throw new Error(
        `server process exited before becoming ready (port ${PORT} busy? build missing?)\n--- server output ---\n${serverOutput}`,
      );
    }
    try {
      await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2_000) });
      return; // any HTTP response (even 500) means the socket is up
    } catch {
      await sleep(500);
    }
  }
  throw new Error(
    `server not reachable on ${BASE} after ${READY_TIMEOUT_MS / 1000}s\n--- server output ---\n${serverOutput}`,
  );
}

/* -------------------------------- checks --------------------------------- */

async function checkRoute({ path, expect, location }) {
  const result = {
    path,
    expect,
    status: null,
    h1Count: null,
    titleOk: null,
    pass: false,
    note: "",
  };
  try {
    const res = await fetch(`${BASE}${path}`, {
      redirect: location ? "manual" : "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { accept: "text/html" },
    });
    result.status = res.status;
    const statusOk = res.status === expect;
    if (location && statusOk) {
      const actualLocation = res.headers.get("location");
      result.pass = actualLocation === location;
      if (!result.pass) {
        result.note = `expected location ${location}, got ${actualLocation ?? "(missing)"}`;
      }
    } else if (expect === 200 && statusOk) {
      const html = await res.text();
      result.h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
      result.titleOk = /<title[^>]*>\s*\S[\s\S]*?<\/title>/i.test(html);
      result.pass = result.h1Count === 1 && result.titleOk;
      if (result.h1Count !== 1) result.note = `expected exactly one <h1, got ${result.h1Count}`;
      else if (!result.titleOk) result.note = "missing/empty <title>";
    } else {
      result.pass = statusOk;
      if (!statusOk) result.note = `expected HTTP ${expect}`;
    }
  } catch (error) {
    result.note = error?.name === "TimeoutError" ? "fetch timeout" : String(error?.message ?? error);
  }
  return result;
}

/* ---------------------------------- main ---------------------------------- */

let exitCode = 1;
try {
  console.log(`[smoke] mode=${MODE} port=${PORT} (pid ${child.pid}) — waiting for server…`);
  await waitForServer();

  // Rows stream as they complete (dev mode compiles per request and can be
  // slow — streamed output keeps partial runs diagnosable in capped shells).
  const w = Math.max(...ROUTES.map((r) => r.path.length), "route".length);
  console.log(`\n  ${"route".padEnd(w)}  want  got   h1s  title  result`);
  console.log(`  ${"-".repeat(w)}  ----  ----  ---  -----  ------`);
  const results = [];
  for (const route of ROUTES) {
    const r = await checkRoute(route); // serial: keeps dev-compile honest
    results.push(r);
    console.log(
      `  ${r.path.padEnd(w)}  ${String(r.expect).padEnd(4)}  ${String(r.status ?? "ERR").padEnd(4)}  ` +
        `${String(r.h1Count ?? "-").padEnd(3)}  ${r.titleOk == null ? "-" : r.titleOk ? "yes" : "NO"}    ` +
        `${r.pass ? "PASS" : `FAIL${r.note ? ` (${r.note})` : ""}`}`,
    );
  }

  const failed = results.filter((r) => !r.pass);
  if (failed.length === 0) {
    console.log(`\n[smoke] PASS — ${results.length}/${results.length} routes ok\n`);
    exitCode = 0;
  } else {
    console.error(`\n[smoke] FAIL — ${failed.length}/${results.length} route(s) failing\n`);
    if (results.some((r) => typeof r.status === "number" && r.status >= 500)) {
      console.error(`--- server output (tail) ---\n${serverOutput}\n----------------------------`);
    }
  }
} catch (error) {
  console.error(`[smoke] ERROR: ${error.message}`);
} finally {
  await killServer();
}
process.exit(exitCode);
