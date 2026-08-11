#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const backup = path.join(root, "theme-backups", "logo-theme-2026-07-12");
const files = [
  ".gitignore",
  ".vercelignore",
  "package.json",
  "app/layout.tsx",
  "app/page.tsx",
  "styles/tokens.css",
  "components/ui/badge.tsx",
  "components/ui/button.tsx",
  "components/patterns/CategoryTile.tsx",
  "components/patterns/QuoteForm.tsx",
];

if (!fs.existsSync(backup)) throw new Error(`Theme backup not found: ${backup}`);
for (const relative of files) {
  const plainSource = path.join(backup, relative);
  const source = fs.existsSync(plainSource) ? plainSource : `${plainSource}.bak`;
  const destination = path.join(root, relative);
  if (!fs.existsSync(source)) throw new Error(`Backup file missing: ${source}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

console.log("Restored the pre-logo theme from:");
console.log(backup);
console.log("The restore script can now be removed manually if it is no longer needed.");
