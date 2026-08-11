#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(root, "content");
const publicDir = path.join(root, "public");
const refs = new Set();

function collect(value) {
  if (typeof value === "string" && /^\/.*\.(avif|jpe?g|png|svg|webp)$/i.test(value)) {
    refs.add(value.split("?")[0]);
  } else if (Array.isArray(value)) {
    value.forEach(collect);
  } else if (value && typeof value === "object") {
    Object.values(value).forEach(collect);
  }
}

for (const file of fs.readdirSync(contentDir).filter((name) => name.endsWith(".json"))) {
  collect(JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8")));
}

const rows = [...refs].map((url) => ({
  url,
  file: path.join(publicDir, ...decodeURIComponent(url).slice(1).split("/")),
}));
const missing = rows.filter(({ file }) => !fs.existsSync(file));
const totalBytes = rows.reduce(
  (sum, { file }) => sum + (fs.existsSync(file) ? fs.statSync(file).size : 0),
  0,
);

console.log(`Referenced images: ${rows.length}`);
console.log(`Resolved images:   ${rows.length - missing.length}`);
console.log(`Resolved size:     ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
if (missing.length) {
  console.error(`Missing images:    ${missing.length}`);
  for (const { url } of missing) console.error(`  ${url}`);
  process.exitCode = 1;
} else {
  console.log("Missing images:    0");
}
