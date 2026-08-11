#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const sourceBannerDir = path.join(root, "Blogs Banner for Vital");

function walk(directory, files = []) {
  if (!fs.existsSync(directory)) return files;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(file, files);
    else if (entry.name.toLowerCase().endsWith(".png")) files.push(file);
  }
  return files;
}

const sources = [...walk(publicDir), ...walk(sourceBannerDir)];
if (!sources.length) {
  console.log("No deployable PNG files remain to convert.");
  process.exit(0);
}

let cursor = 0;
const converted = [];
async function worker() {
  while (cursor < sources.length) {
    const source = sources[cursor++];
    const output = source.replace(/\.png$/i, ".webp");
    const isLogo = path.basename(source).toLowerCase() === "vital logo.png";
    const args = isLogo
      ? ["-quiet", "-lossless", "-m", "6", source, "-o", output]
      : ["-quiet", "-q", "82", "-m", "6", "-alpha_q", "100", source, "-o", output];
    await execFileAsync("cwebp", args);

    const [before, after] = await Promise.all([sharp(source).metadata(), sharp(output).metadata()]);
    if (before.width !== after.width || before.height !== after.height) {
      throw new Error(`Dimension mismatch after conversion: ${source}`);
    }
    converted.push({ source, output });
  }
}

const workerCount = Math.min(Math.max(os.cpus().length - 1, 2), 8, sources.length);
await Promise.all(Array.from({ length: workerCount }, worker));

const textRoots = ["app", "components", "content", "lib", "styles"];
const textFiles = [];
function collectText(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) collectText(file);
    else if (/\.(css|json|ts|tsx)$/i.test(entry.name)) textFiles.push(file);
  }
}
for (const directory of textRoots) collectText(path.join(root, directory));
textFiles.push(path.join(root, "scripts", "generate-content.mjs"));

const replacements = [];
for (const { source } of converted) {
  if (!source.startsWith(`${publicDir}${path.sep}`)) continue;
  const relative = path.relative(publicDir, source).split(path.sep).join("/");
  const rawUrl = `/${relative}`;
  const encodedUrl = `/${relative.split("/").map(encodeURIComponent).join("/")}`;
  replacements.push([rawUrl, rawUrl.replace(/\.png$/i, ".webp")]);
  if (encodedUrl !== rawUrl) {
    replacements.push([encodedUrl, encodedUrl.replace(/\.png$/i, ".webp")]);
  }
  const uploadPrefix = "img/hm/wp-content/uploads/";
  if (relative.startsWith(uploadPrefix)) {
    const shortPath = relative.slice(uploadPrefix.length);
    replacements.push([shortPath, shortPath.replace(/\.png$/i, ".webp")]);
  }
}

for (const file of textFiles) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, "utf8");
  let updated = original;
  for (const [from, to] of replacements) updated = updated.replaceAll(from, to);
  if (updated !== original) fs.writeFileSync(file, updated);
}

let originalBytes = 0;
let webpBytes = 0;
for (const { source, output } of converted) {
  originalBytes += fs.statSync(source).size;
  webpBytes += fs.statSync(output).size;
}
for (const { source } of converted) fs.unlinkSync(source);

console.log(`Converted and removed ${converted.length} PNG files.`);
console.log(`${(originalBytes / 1024 / 1024).toFixed(1)} MB PNG -> ${(webpBytes / 1024 / 1024).toFixed(1)} MB WebP`);
console.log("Kept app/apple-icon.png because it is a required Apple metadata icon.");
