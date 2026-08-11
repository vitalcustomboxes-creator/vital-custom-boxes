#!/usr/bin/env node
/**
 * scripts/localize-images.mjs — one-time image migration.
 *
 * WHY: the old WordPress sites (hmcustompackaging.com / vitalcustomboxes.com)
 * are being taken offline, so every product/category/post/case-study image that
 * currently points at those hosts would 404 once they're down. This script
 * downloads every such image INTO the repo (public/img/...) and rewrites the
 * `imageUrl` references in content/*.json to local, self-hosted paths.
 *
 * RULES (per client):
 *   - Images on hmcustompackaging.com OR vitalcustomboxes.com  → download + rewrite to /img/...
 *   - Images on any other (true 3rd-party) host                → left untouched
 *   - Already-local paths (/img/..., /VITAL%20Logo.png, etc.) → skipped (idempotent)
 *
 * RUN THIS WHERE THERE IS NETWORK ACCESS (your machine or CI) — the Cowork
 * sandbox has no egress to those hosts. Node 18+ (uses global fetch).
 *
 *   node scripts/localize-images.mjs            # download + rewrite JSON
 *   node scripts/localize-images.mjs --dry-run  # report only, no writes
 *
 * After a successful real run: commit public/img/** and the updated content/*.json.
 * The content gates already accept local "/img/..." paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const DRY = process.argv.includes('--dry-run');
const CONCURRENCY = 8;

const HOST_MAP = [
  { host: 'www.hmcustompackaging.com', ns: 'hm' },
  { host: 'hmcustompackaging.com', ns: 'hm' },
  { host: 'www.vitalcustomboxes.com', ns: 'vital' },
  { host: 'vitalcustomboxes.com', ns: 'vital' },
];

const IMG_RE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;

/** Map a remote image URL to a collision-proof local path, or null to skip. */
function toLocal(url) {
  if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) return null;
  let u;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const match = HOST_MAP.find((h) => h.host === u.hostname);
  if (!match) return null; // genuine 3rd-party → leave it
  if (!IMG_RE.test(u.pathname)) return null;
  // /wp-content/uploads/2025/11/Foo.png → /img/<ns>/wp-content/uploads/2025/11/Foo.png
  const rel = `/img/${match.ns}${u.pathname}`.replace(/\/{2,}/g, '/');
  return { localUrl: rel, fsPath: path.join(PUBLIC_DIR, rel) };
}

/** Collect every (file, jsonpath, url) image reference across content/*.json. */
function collect() {
  const refs = [];
  for (const file of fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.json'))) {
    const abs = path.join(CONTENT_DIR, file);
    const data = JSON.parse(fs.readFileSync(abs, 'utf8'));
    const walk = (node) => {
      if (Array.isArray(node)) node.forEach(walk);
      else if (node && typeof node === 'object') {
        for (const k of Object.keys(node)) {
          const v = node[k];
          if (typeof v === 'string') {
            const mapped = toLocal(v);
            if (mapped) refs.push({ file, abs, setter: (nv) => (node[k] = nv), url: v, ...mapped });
          } else walk(v);
        }
      }
    };
    const root = data;
    const docs = [{ data: root, save: () => fs.writeFileSync(abs, JSON.stringify(root, null, 2) + '\n') }];
    walk(root);
    refs._docs = refs._docs || new Map();
    refs._docs.set(abs, docs[0].save);
  }
  return refs;
}

async function download(url, fsPath) {
  if (fs.existsSync(fsPath)) return 'exists';
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(fsPath), { recursive: true });
  fs.writeFileSync(fsPath, buf);
  return `ok (${(buf.length / 1024).toFixed(0)} kB)`;
}

async function main() {
  const refs = collect();
  const unique = new Map(); // url -> {fsPath, localUrl}
  for (const r of refs) if (!unique.has(r.url)) unique.set(r.url, r);

  console.log(`Found ${refs.length} image references (${unique.size} unique) on hm/vital across content/*.json.`);
  if (DRY) {
    let i = 0;
    for (const [url, r] of unique) {
      if (i++ < 12) console.log(`  ${url}\n     → ${r.localUrl}`);
    }
    if (unique.size > 12) console.log(`  …and ${unique.size - 12} more.`);
    console.log('\nDRY RUN — no files downloaded, no JSON rewritten.');
    return;
  }

  // download (bounded concurrency)
  const entries = [...unique.values()];
  let okc = 0, skc = 0, errc = 0;
  const errors = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (r) => {
        try {
          const status = await download(r.url, r.fsPath);
          if (status === 'exists') skc++;
          else okc++;
        } catch (e) {
          errc++;
          errors.push(`${r.url} — ${e.message}`);
        }
      }),
    );
    process.stdout.write(`\r  downloaded ${okc}, skipped ${skc}, failed ${errc} / ${entries.length}`);
  }
  process.stdout.write('\n');

  if (errc) {
    console.error(`\n${errc} download(s) FAILED — JSON will NOT be rewritten so nothing breaks:`);
    for (const e of errors.slice(0, 20)) console.error('  ✗ ' + e);
    process.exit(1);
  }

  // rewrite JSON only after every image is safely on disk
  for (const r of refs) r.setter(r.localUrl);
  for (const save of refs._docs.values()) save();
  console.log(`\n✅ Localized ${unique.size} images into public/img/ and rewrote ${refs.length} references.`);
  console.log('Next: review `git status`, commit public/img/** + content/*.json, then redeploy.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
