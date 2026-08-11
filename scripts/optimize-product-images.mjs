#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(root, "content");
const publicDir = path.join(root, "public");
const archiveDir = path.join(root, "asset-archive", "original-product-images");
const legacyRoots = ["Product Images 2", "Products Images"];
const quality = "82";

if (fs.existsSync(archiveDir)) {
  const remainingSources = legacyRoots.some((dir) => {
    const publicRoot = path.join(publicDir, dir);
    return fs.existsSync(publicRoot) && fs.readdirSync(publicRoot, { recursive: true })
      .some((name) => String(name).toLowerCase().endsWith(".png"));
  });
  if (remainingSources) {
    throw new Error(
      `Archive already exists and new PNG files are present. Move or rename ${archiveDir} before running again.`,
    );
  }
  console.log(`Product images are already optimized. Recovery archive: ${archiveDir}`);
  process.exit(0);
}

const contentFiles = fs.readdirSync(contentDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => path.join(contentDir, name));
const documents = new Map(
  contentFiles.map((file) => [file, JSON.parse(fs.readFileSync(file, "utf8"))]),
);
const refs = new Set();

function collect(value) {
  if (typeof value === "string") {
    const clean = value.split("?")[0];
    if (legacyRoots.some((dir) => clean.startsWith(`/${encodeURIComponent(dir)}/`))) refs.add(clean);
  } else if (Array.isArray(value)) {
    value.forEach(collect);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(collect);
  }
}
documents.forEach(collect);

fs.mkdirSync(archiveDir, { recursive: true });
for (const dir of legacyRoots) {
  const source = path.join(publicDir, dir);
  if (!fs.existsSync(source)) throw new Error(`Missing source directory: ${source}`);
  fs.renameSync(source, path.join(archiveDir, dir));
}

const convertible = [...refs].flatMap((url) => {
  const relative = decodeURIComponent(url).slice(1);
  const source = path.join(archiveDir, relative);
  if (!fs.existsSync(source)) {
    console.warn(`Skipping missing source: ${url}`);
    return [];
  }
  if (!source.toLowerCase().endsWith(".png")) return [];
  return [{ url, source, output: path.join(publicDir, relative.replace(/\.png$/i, ".webp")) }];
});

let cursor = 0;
async function worker() {
  while (cursor < convertible.length) {
    const item = convertible[cursor++];
    fs.mkdirSync(path.dirname(item.output), { recursive: true });
    await execFileAsync("cwebp", [
      "-quiet", "-q", quality, "-m", "6", "-alpha_q", "100",
      item.source, "-o", item.output,
    ]);
  }
}

const workers = Math.min(Math.max(os.cpus().length - 1, 2), 8, convertible.length);
await Promise.all(Array.from({ length: workers }, worker));

const replacements = new Map(
  convertible.map(({ url }) => [url, url.replace(/\.png$/i, ".webp")]),
);
function replace(value) {
  if (typeof value === "string") return replacements.get(value) ?? value;
  if (Array.isArray(value)) return value.map(replace);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replace(child)]));
  }
  return value;
}

for (const [file, document] of documents) {
  fs.writeFileSync(file, `${JSON.stringify(replace(document), null, 2)}\n`);
}

const originalBytes = convertible.reduce((sum, item) => sum + fs.statSync(item.source).size, 0);
const optimizedBytes = convertible.reduce((sum, item) => sum + fs.statSync(item.output).size, 0);
console.log(`Converted ${convertible.length} referenced PNG files at WebP quality ${quality}.`);
console.log(`Referenced legacy assets: ${(originalBytes / 1024 / 1024).toFixed(1)} MB -> ${(optimizedBytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`Original and unreferenced files archived at ${archiveDir}`);
