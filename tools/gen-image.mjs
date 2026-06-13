#!/usr/bin/env node
/**
 * Wereact Website Factory — Asset Engine
 *
 * Provider-agnostic image generator with an automatic fallback chain.
 * higgsfield (cinematic/video) is handled by the asset agent via its MCP tools;
 * THIS tool is the backup chain that runs when higgsfield is unavailable:
 *
 *     Google Gemini "Nano Banana"  →  FLUX via fal.ai  →  FLUX via Together AI
 *
 * Usage:
 *   node gen-image.mjs --prompt "a cinematic hero shot of ..." --out public/hero.png
 *   node gen-image.mjs --prompt "..." --out icon.png --type icon
 *   node gen-image.mjs --prompt "..." --out og.png --type og --provider gemini
 *
 * Flags:
 *   --prompt   <text>     (required) the image description
 *   --out      <path>     (required) where to save the PNG/JPG
 *   --type     <kind>     hero|og|square|portrait|icon  (sets aspect; default hero)
 *   --aspect   <a>        16:9|1:1|4:3|9:16|3:2         (overrides --type)
 *   --provider <name>     gemini|fal|together           (force one; default = try all)
 *
 * Exit code 0 on success (prints JSON {ok,provider,path}); non-zero on total failure.
 * Reads keys from environment or a .env file at the factory root.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FACTORY_ROOT = path.resolve(__dirname, '..');

// ---- tiny .env loader (no dependency) -------------------------------------
function loadEnv() {
  for (const f of [path.join(process.cwd(), '.env'), path.join(FACTORY_ROOT, '.env')]) {
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

// ---- arg parsing ----------------------------------------------------------
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[i + 1], i++;
  }
  return a;
}

// ---- aspect → dimensions --------------------------------------------------
const TYPE_ASPECT = { hero: '16:9', og: '16:9', square: '1:1', portrait: '9:16', icon: '1:1' };
const ASPECT_DIMS = {
  '16:9': { w: 1536, h: 864 },
  '1:1':  { w: 1024, h: 1024 },
  '4:3':  { w: 1280, h: 960 },
  '3:2':  { w: 1344, h: 896 },
  '9:16': { w: 864,  h: 1536 },
};
const FAL_SIZE = {
  '16:9': 'landscape_16_9', '1:1': 'square_hd',
  '4:3': 'landscape_4_3', '3:2': 'landscape_4_3', '9:16': 'portrait_16_9',
};

function resolveAspect(args) {
  if (args.aspect && ASPECT_DIMS[args.aspect]) return args.aspect;
  return TYPE_ASPECT[args.type] || '16:9';
}

// ---- providers ------------------------------------------------------------
// Each returns a Buffer of image bytes, or throws.

async function viaGemini(prompt, aspect) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set');
  const model = 'gemini-2.5-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{ parts: [{ text: `${prompt}. Aspect ratio ${aspect}, high resolution, photographic detail, no text or watermark.` }] }],
    generationConfig: { responseModalities: ['IMAGE'] },
  };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`gemini HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const parts = j?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p.inlineData?.data);
  if (!img) throw new Error('gemini returned no image');
  return Buffer.from(img.inlineData.data, 'base64');
}

async function viaFal(prompt, aspect) {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error('FAL_KEY not set');
  const r = await fetch('https://fal.run/fal-ai/flux/dev', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Key ${key}` },
    body: JSON.stringify({ prompt, image_size: FAL_SIZE[aspect] || 'landscape_16_9', num_images: 1, enable_safety_checker: true }),
  });
  if (!r.ok) throw new Error(`fal HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const imgUrl = j?.images?.[0]?.url;
  if (!imgUrl) throw new Error('fal returned no image url');
  const ir = await fetch(imgUrl);
  if (!ir.ok) throw new Error(`fal image download HTTP ${ir.status}`);
  return Buffer.from(await ir.arrayBuffer());
}

async function viaTogether(prompt, aspect) {
  const key = process.env.TOGETHER_API_KEY;
  if (!key) throw new Error('TOGETHER_API_KEY not set');
  const { w, h } = ASPECT_DIMS[aspect] || ASPECT_DIMS['16:9'];
  const r = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'black-forest-labs/FLUX.1-schnell-Free', prompt, width: w, height: h, n: 1, response_format: 'b64_json' }),
  });
  if (!r.ok) throw new Error(`together HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  const d = j?.data?.[0];
  if (d?.b64_json) return Buffer.from(d.b64_json, 'base64');
  if (d?.url) { const ir = await fetch(d.url); return Buffer.from(await ir.arrayBuffer()); }
  throw new Error('together returned no image');
}

const PROVIDERS = { gemini: viaGemini, fal: viaFal, together: viaTogether };
const DEFAULT_ORDER = ['gemini', 'fal', 'together'];

// ---- main -----------------------------------------------------------------
async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.prompt || !args.out) {
    console.error('Usage: gen-image.mjs --prompt "..." --out path [--type hero|og|square|portrait|icon] [--aspect 16:9] [--provider gemini|fal|together]');
    process.exit(2);
  }
  const aspect = resolveAspect(args);
  const order = args.provider ? [args.provider] : DEFAULT_ORDER;
  const errors = [];

  for (const name of order) {
    const fn = PROVIDERS[name];
    if (!fn) { errors.push(`${name}: unknown provider`); continue; }
    try {
      const buf = await fn(args.prompt, aspect);
      fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
      fs.writeFileSync(args.out, buf);
      console.log(JSON.stringify({ ok: true, provider: name, path: args.out, aspect, bytes: buf.length }));
      process.exit(0);
    } catch (e) {
      errors.push(`${name}: ${e.message}`);
    }
  }
  console.error(JSON.stringify({ ok: false, errors }));
  process.exit(1);
}

main();
