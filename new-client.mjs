#!/usr/bin/env node
/**
 * Scaffold a new client folder from clients/_TEMPLATE.
 *
 *   node new-client.mjs <slug> ["Client Name"]
 *   e.g. node new-client.mjs atlas-coffee "Atlas Coffee"
 *
 * Creates clients/<slug>/ with brief.md, branding.md, design.md, assets/.
 * Fill them in (drop a logo in assets/ if you have one), then tell Claude:
 *   "build <slug>"
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
const name = process.argv[3] || slug;

if (!slug || /[^a-z0-9-]/.test(slug)) {
  console.error('Usage: node new-client.mjs <slug> ["Client Name"]   (slug = lowercase-with-dashes)');
  process.exit(2);
}

const src = path.join(ROOT, 'clients', '_TEMPLATE');
const dest = path.join(ROOT, 'clients', slug);
if (fs.existsSync(dest)) {
  console.error(`clients/${slug} already exists — pick another slug or edit it directly.`);
  process.exit(1);
}

// recursive copy + replace <Client Name> placeholder in .md files
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const f = path.join(from, entry.name);
    const t = path.join(to, entry.name);
    if (entry.isDirectory()) copy(f, t);
    else if (entry.name.endsWith('.md')) fs.writeFileSync(t, fs.readFileSync(f, 'utf8').replaceAll('<Client Name>', name));
    else fs.copyFileSync(f, t);
  }
}
copy(src, dest);

console.log(`✓ Created clients/${slug}/`);
console.log(`  Fill in brief.md / branding.md / design.md (blanks are auto-generated).`);
console.log(`  Optional: drop a logo + photos in clients/${slug}/assets/`);
console.log(`  Then tell Claude:  build ${slug}`);
