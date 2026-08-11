#!/usr/bin/env node
/**
 * scripts/qa-crawl.mjs — owner: QA-AUTO.
 *
 * Post-build HTML quality crawl (CI stage after scripts/smoke.mjs — see
 * .github/workflows/ci.yml). Boots `next start` against the existing .next/
 * production build (REQUIRED — exits 1 if missing; same-job-after-build rule
 * as smoke/budgets), fetches a ~23-page representative sample and asserts the
 * PROJECT_BRIEF audit rules per page:
 *
 *   1. HTTP 200
 *   2. exactly one <h1
 *   3. at most ONE FAQPage JSON-LD node (audit: one FAQ block per page)
 *   4. BreadcrumbList JSON-LD present on inner pages (everything except /)
 *   5. no 'undefined' / 'NaN' / '[object Object]' literals in visible HTML
 *      (script/style bodies stripped first — JS chunks legitimately contain
 *      the word undefined)
 *   6. no banned live-site claims (docs/seo/CONTENT_GUIDELINES.md §8): fake
 *      "no minimum"/worldwide-shipping promises, contradictory turnaround
 *      variants, the two broken phone forms, foreign custompackaging.com links
 *   7. every tel: href is exactly tel:+18284550798 (globals.phoneHref)
 *   8. no insecure http://www.hmcustompackaging links anywhere in the payload
 *   9. every <img> tag carries an alt attribute
 *
 * Sample: home · 5 categories (incl. regulated mylar-bags + business-card) ·
 * 10 products spread across categories (regulated ones first) · quote ·
 * contact · reviews · blog index + 1 post · HTML sitemap · 2 legal pages.
 * Product/post slugs are derived from /content at runtime so the script
 * survives content updates without edits.
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.QA_CRAWL_PORT ?? 3200);
const BASE = `http://127.0.0.1:${PORT}`;
const READY_TIMEOUT_MS = 30_000;
const FETCH_TIMEOUT_MS = 15_000;

/* ----------------------------- preconditions ----------------------------- */

const hasBuild =
  existsSync(join(ROOT, ".next", "BUILD_ID")) &&
  existsSync(join(ROOT, ".next", "prerender-manifest.json"));
if (!hasBuild) {
  console.error(
    "[qa-crawl] No production build found (.next/BUILD_ID missing).\n" +
      "[qa-crawl] Run: npm run build && node scripts/qa-crawl.mjs",
  );
  process.exit(1);
}

/* ------------------------------ sample routes ---------------------------- */

const readJson = (rel) => JSON.parse(readFileSync(join(ROOT, rel), "utf8"));
const posts = readJson("content/posts.json");

/**
 * Pick products from the generated sitemap rather than bundled products.json.
 * Production may use a published R2 snapshot whose membership differs from the
 * bundled fallback; only URLs in the public sitemap belong in this crawl.
 */
async function samplePublicProducts() {
  const preferredCategories = [
    "mylar-bags", // regulated — disclaimer must render
    "custom-tobacco-packaging", // regulated
    "custom-cbd-boxes", // regulated
    "custom-pizza-boxes",
    "custom-bakery-boxes",
    "custom-rigid-boxes",
    "custom-mailer-boxes",
    "custom-food-boxes",
    "custom-cosmetics-boxes",
    "custom-gift-boxes",
  ];
  const xml = await (await fetch(`${BASE}/sitemap.xml`)).text();
  const productPaths = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => new URL(decodeEntities(match[1])).pathname)
    .filter((path) => path.split("/").filter(Boolean).length === 3 && path.startsWith("/shop/"));

  const byCategory = new Map();
  for (const path of productPaths) {
    const [, , category] = path.split("/");
    if (!byCategory.has(category)) byCategory.set(category, []);
    byCategory.get(category).push(path);
  }
  const picked = [];
  for (const cat of preferredCategories) {
    const list = byCategory.get(cat);
    if (list?.length) picked.push(list[0]);
    if (picked.length === 10) break;
  }
  // top up from any remaining categories (content drift safety)
  for (const [cat, list] of byCategory) {
    if (picked.length === 10) break;
    if (!preferredCategories.includes(cat) && list.length) picked.push(list[0]);
  }
  return picked.map((path) => ({ path, inner: true }));
}

const BASE_ROUTES = [
  { path: "/", inner: false },
  { path: "/shop/mylar-bags/", inner: true }, // regulated category
  { path: "/shop/business-card/", inner: true },
  { path: "/shop/custom-pizza-boxes/", inner: true },
  { path: "/shop/custom-bakery-boxes/", inner: true },
  { path: "/shop/custom-rigid-boxes/", inner: true },
  { path: "/get-custom-quote/", inner: true },
  { path: "/contact/", inner: true },
  { path: "/reviews/", inner: true },
  { path: "/blog/", inner: true },
  { path: `/blog/${posts[0].slug}/`, inner: true },
  { path: "/sitemap/", inner: true }, // HTML sitemap (PM decision: lives AT /sitemap/)
  { path: "/terms-conditions/", inner: true },
  { path: "/privacy-policy/", inner: true },
];

/* ------------------------------- assertions ------------------------------ */

/** Same banned list as tests/content.integrity.test.ts — keep in sync. */
const BANNED_CLAIMS = [
  /no minimum/i,
  /worldwide shipping/i,
  /2[-–]3 weeks/i,
  /7[-–]15 days/i,
  /4[-–]8 days/i,
  /3[-–]7 days/i,
  /10[-–]15 business/i,
  /6926-437/, // mis-grouped display phone
  /078-2376/, // broken legacy tel
  /(?<!hm)custompackaging\.com/i, // foreign domain (hmcustompackaging.com ok)
];

const CANONICAL_TEL = "tel:+18284550798";

function extractJsonLd(html) {
  const nodes = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      nodes.push(JSON.parse(m[1]));
    } catch {
      nodes.push({ __parseError: true });
    }
  }
  return nodes;
}

/** Recursively count schema nodes whose @type is/includes `type`. */
function countSchemaType(node, type) {
  if (Array.isArray(node)) return node.reduce((n, x) => n + countSchemaType(x, type), 0);
  if (node && typeof node === "object") {
    const t = node["@type"];
    const self = t === type || (Array.isArray(t) && t.includes(type)) ? 1 : 0;
    return (
      self +
      Object.values(node).reduce(
        (n, v) => n + (v && typeof v === "object" ? countSchemaType(v, type) : 0),
        0,
      )
    );
  }
  return 0;
}

function checkPage(path, inner, html) {
  const failures = [];

  // 2. exactly one h1
  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) failures.push(`expected exactly one <h1, got ${h1Count}`);

  // 3./4. JSON-LD
  const jsonLd = extractJsonLd(html);
  if (jsonLd.some((n) => n.__parseError)) failures.push("unparseable JSON-LD block");
  const faqPages = countSchemaType(jsonLd, "FAQPage");
  if (faqPages > 1) failures.push(`${faqPages} FAQPage JSON-LD nodes (max 1)`);
  if (inner && countSchemaType(jsonLd, "BreadcrumbList") < 1) {
    failures.push("missing BreadcrumbList JSON-LD on inner page");
  }

  // 5./6. visible-HTML literals + banned claims (scripts/styles stripped)
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");
  for (const [re, label] of [
    [/\bundefined\b/, "'undefined' literal"],
    [/\bNaN\b/, "'NaN' literal"],
    [/\[object Object\]/, "'[object Object]' literal"],
  ]) {
    const hit = visible.match(re);
    if (hit) {
      failures.push(
        `${label} in visible HTML: …${visible.slice(Math.max(0, hit.index - 60), hit.index + 60).replace(/\s+/g, " ")}…`,
      );
    }
  }
  for (const re of BANNED_CLAIMS) {
    const hit = visible.match(re);
    if (hit) failures.push(`banned claim ${re} → ${JSON.stringify(hit[0])}`);
  }

  // 7. tel: hrefs
  const telHrefs = [...html.matchAll(/href="(tel:[^"]*)"/gi)].map((m) => m[1]);
  const badTel = telHrefs.filter((t) => t !== CANONICAL_TEL);
  if (badTel.length) failures.push(`non-canonical tel link(s): ${[...new Set(badTel)].join(", ")}`);

  // 8. insecure scheme on own domain (raw payload, scripts included)
  if (/http:\/\/www\.hmcustompackaging/i.test(html)) {
    failures.push("insecure http://www.hmcustompackaging link");
  }

  // 9. img alt presence
  const imgs = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imgs.filter((tag) => !/\salt\s*=/i.test(tag));
  if (missingAlt.length) {
    failures.push(`${missingAlt.length} <img> without alt (first: ${missingAlt[0].slice(0, 80)}…)`);
  }

  return failures;
}

/* -------------------------- full sitemap SEO audit ----------------------- */

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function duplicateValues(rows, key) {
  const values = new Map();
  for (const row of rows) {
    const value = row[key];
    if (!value) continue;
    values.set(value, [...(values.get(value) ?? []), row.path]);
  }
  return [...values]
    .filter(([, paths]) => paths.length > 1)
    .map(([value, paths]) => `${JSON.stringify(value)} → ${paths.join(", ")}`);
}

async function checkSitemapAndRobots() {
  const failures = [];
  const sitemapResponse = await fetch(`${BASE}/sitemap.xml`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const xml = await sitemapResponse.text();

  if (sitemapResponse.status !== 200) {
    failures.push(`/sitemap.xml returned HTTP ${sitemapResponse.status}`);
    return { failures, urlCount: 0 };
  }
  if (Buffer.byteLength(xml) > 50 * 1024 * 1024) {
    failures.push("sitemap exceeds Google's 50 MB uncompressed limit");
  }

  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) =>
    decodeEntities(match[1]),
  );
  if (urls.length === 0) failures.push("sitemap has no <loc> entries");
  if (urls.length > 50_000) failures.push("sitemap exceeds Google's 50,000 URL limit");
  if (new Set(urls).size !== urls.length) failures.push("sitemap contains duplicate URLs");

  const invalidUrls = urls.filter((url) => {
    try {
      const parsed = new URL(url);
      return (
        parsed.origin !== "https://www.vitalcustomboxes.com" ||
        (parsed.pathname !== "/" && !parsed.pathname.endsWith("/")) ||
        parsed.search !== "" ||
        parsed.hash !== ""
      );
    } catch {
      return true;
    }
  });
  if (invalidUrls.length) {
    failures.push(`invalid/non-canonical sitemap URL(s): ${invalidUrls.slice(0, 5).join(", ")}`);
  }

  const pages = [];
  for (let index = 0; index < urls.length; index += 16) {
    const batch = urls.slice(index, index + 16);
    pages.push(
      ...(await Promise.all(
        batch.map(async (url) => {
          const parsed = new URL(url);
          const response = await fetch(`${BASE}${parsed.pathname}`, {
            redirect: "manual",
            signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
            headers: { accept: "text/html" },
          });
          const html = await response.text();
          const titles = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)];
          const canonicals = [
            ...html.matchAll(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"[^>]*>/gi),
          ];
          return {
            url,
            path: parsed.pathname,
            status: response.status,
            title: titles.length === 1 ? decodeEntities(titles[0][1].trim()) : "",
            titleCount: titles.length,
            canonical: canonicals.length === 1 ? canonicals[0][1] : "",
            canonicalCount: canonicals.length,
            noindex: /<meta[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(html),
          };
        }),
      )),
    );
  }

  const badStatus = pages.filter((page) => page.status !== 200);
  const badTitles = pages.filter((page) => page.titleCount !== 1 || !page.title);
  const badCanonicals = pages.filter(
    (page) => page.canonicalCount !== 1 || page.canonical !== page.url,
  );
  const noindexPages = pages.filter((page) => page.noindex);
  const duplicateTitles = duplicateValues(pages, "title");
  const duplicateCanonicals = duplicateValues(pages, "canonical");

  if (badStatus.length) {
    failures.push(
      `non-200 sitemap page(s): ${badStatus
        .slice(0, 8)
        .map((page) => `${page.path}=${page.status}`)
        .join(", ")}`,
    );
  }
  if (badTitles.length) {
    failures.push(
      `missing/multiple title(s): ${badTitles
        .slice(0, 8)
        .map((page) => `${page.path}=${page.titleCount}`)
        .join(", ")}`,
    );
  }
  if (badCanonicals.length) {
    failures.push(
      `missing/non-self canonical(s): ${badCanonicals
        .slice(0, 8)
        .map((page) => page.path)
        .join(", ")}`,
    );
  }
  if (noindexPages.length) {
    failures.push(
      `noindex URL(s) included in sitemap: ${noindexPages
        .slice(0, 8)
        .map((page) => page.path)
        .join(", ")}`,
    );
  }
  if (duplicateTitles.length) {
    failures.push(`duplicate page title(s): ${duplicateTitles.slice(0, 5).join("; ")}`);
  }
  if (duplicateCanonicals.length) {
    failures.push(
      `duplicate canonical URL(s): ${duplicateCanonicals.slice(0, 5).join("; ")}`,
    );
  }

  const robotsResponse = await fetch(`${BASE}/robots.txt`, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const robots = await robotsResponse.text();
  if (robotsResponse.status !== 200) {
    failures.push(`/robots.txt returned HTTP ${robotsResponse.status}`);
  }
  if (!robots.includes("Sitemap: https://www.vitalcustomboxes.com/sitemap.xml")) {
    failures.push("robots.txt does not reference the canonical sitemap URL");
  }
  if (/^Disallow:\s*\/thank-you\/?\s*$/im.test(robots)) {
    failures.push("robots.txt blocks /thank-you/, preventing Google from seeing noindex");
  }

  return { failures, urlCount: urls.length };
}

/* ------------------------------ server boot ------------------------------ */

const nextBin = join(ROOT, "node_modules", "next", "dist", "bin", "next");
const child = spawn(process.execPath, [nextBin, "start", "-p", String(PORT)], {
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
    process.kill(-child.pid, "SIGTERM");
  } catch {
    /* already gone */
  }
  const grace = Date.now() + 1_500;
  while (!childExited && Date.now() < grace) await sleep(100);
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
        `server exited before ready (port ${PORT} busy?)\n--- server output ---\n${serverOutput}`,
      );
    }
    try {
      await fetch(`${BASE}/`, { signal: AbortSignal.timeout(2_000) });
      return;
    } catch {
      await sleep(400);
    }
  }
  throw new Error(`server not reachable on ${BASE}\n--- server output ---\n${serverOutput}`);
}

/* ---------------------------------- main ---------------------------------- */

let exitCode = 1;
try {
  console.log(`[qa-crawl] port=${PORT} pid=${child.pid} — waiting…`);
  await waitForServer();

  const routes = [
    ...BASE_ROUTES.slice(0, 6),
    ...(await samplePublicProducts()),
    ...BASE_ROUTES.slice(6),
  ];
  console.log(`[qa-crawl] ${routes.length} representative routes + full sitemap audit`);

  const w = Math.max(...routes.map((r) => r.path.length), "route".length);
  console.log(`\n  ${"route".padEnd(w)}  result`);
  console.log(`  ${"-".repeat(w)}  ------`);

  let failedPages = 0;
  for (const { path, inner } of routes) {
    let line;
    try {
      const res = await fetch(`${BASE}${path}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { accept: "text/html" },
      });
      if (res.status !== 200) {
        failedPages += 1;
        line = `FAIL (HTTP ${res.status})`;
      } else {
        const failures = checkPage(path, inner, await res.text());
        if (failures.length === 0) {
          line = "PASS";
        } else {
          failedPages += 1;
          line = `FAIL\n${failures.map((f) => `      - ${f}`).join("\n")}`;
        }
      }
    } catch (error) {
      failedPages += 1;
      line = `FAIL (${error?.name === "TimeoutError" ? "fetch timeout" : error.message})`;
    }
    console.log(`  ${path.padEnd(w)}  ${line}`);
  }

  const sitemapAudit = await checkSitemapAndRobots();
  if (sitemapAudit.failures.length === 0) {
    console.log(
      `\n  sitemap.xml + robots.txt  PASS (${sitemapAudit.urlCount} unique, 200, indexable, self-canonical URLs; unique titles)`,
    );
  } else {
    failedPages += 1;
    console.log(
      `\n  sitemap.xml + robots.txt  FAIL\n${sitemapAudit.failures
        .map((failure) => `      - ${failure}`)
        .join("\n")}`,
    );
  }

  if (failedPages === 0) {
    console.log(`\n[qa-crawl] PASS — ${routes.length}/${routes.length} representative pages clean\n`);
    exitCode = 0;
  } else {
    console.error(`\n[qa-crawl] FAIL — ${failedPages}/${ROUTES.length} page(s) with findings\n`);
  }
} catch (error) {
  console.error(`[qa-crawl] ERROR: ${error.message}`);
} finally {
  await killServer();
}
process.exit(exitCode);
