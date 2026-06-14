#!/usr/bin/env node
/**
 * Wereact Website Factory — Video Engine
 *
 * Fetches free stock video (Pexels, same key as images) and web-optimizes it
 * with ffmpeg so a 30 MB clip becomes a ~1-3 MB silent loop suitable for a
 * hero background. Also extracts a poster frame (good for LCP).
 *
 * Usage:
 *   node gen-video.mjs --query "coffee roastery" --out public/hero.mp4 --poster public/hero-poster.jpg
 *   node gen-video.mjs --query "ocean waves" --out public/bg.mp4 --webm public/bg.webm --maxsec 8 --width 1600
 *
 * Flags:
 *   --query  <text>   (required) search terms
 *   --out    <path>   (required) optimized mp4 output
 *   --poster <path>   also write a poster JPG (first frame)
 *   --webm   <path>   also write a VP9 webm (smaller, modern browsers)
 *   --maxsec <n>      trim to N seconds (default 10)
 *   --width  <n>      scale to width px, keep aspect (default 1600)
 *   --aspect <a>      16:9|9:16|1:1 → search orientation (default 16:9)
 *
 * For AI-generated bespoke video, use the higgsfield MCP (generate_video) instead.
 * Requires PEXELS_API_KEY in env/.env and ffmpeg on PATH (or ~/.local/bin/ffmpeg).
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FACTORY_ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  for (const f of [path.join(process.cwd(), '.env'), path.join(FACTORY_ROOT, '.env')]) {
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) (a[argv[i].slice(2)] = argv[i + 1]), i++;
  return a;
}

function findFfmpeg() {
  const candidates = [process.env.FFMPEG_PATH, `${os.homedir()}/.local/bin/ffmpeg`, '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg', 'ffmpeg'];
  for (const c of candidates) {
    if (!c) continue;
    try { execFileSync(c, ['-version'], { stdio: 'ignore' }); return c; } catch {}
  }
  return null;
}

const STOCK_ORIENTATION = { '16:9': 'landscape', '9:16': 'portrait', '1:1': 'square' };

async function pexelsVideo(query, aspect) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('PEXELS_API_KEY not set');
  const orientation = STOCK_ORIENTATION[aspect] || 'landscape';
  const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=5&orientation=${orientation}&size=medium`;
  const r = await fetch(url, { headers: { authorization: key } });
  if (!r.ok) throw new Error(`pexels video HTTP ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  const vid = j?.videos?.[0];
  if (!vid) throw new Error(`no stock video for "${query}"`);
  // pick the highest-resolution mp4 that isn't absurdly large
  const file = vid.video_files
    .filter((f) => f.file_type === 'video/mp4')
    .sort((a, b) => (b.width || 0) - (a.width || 0))[0];
  if (!file) throw new Error('no mp4 file in stock video');
  return file.link;
}

async function download(url, dest) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`download HTTP ${r.status}`);
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (!args.query || !args.out) {
    console.error('Usage: gen-video.mjs --query "..." --out public/hero.mp4 [--poster p.jpg] [--webm w.webm] [--maxsec 10] [--width 1600] [--aspect 16:9]');
    process.exit(2);
  }
  const aspect = args.aspect || '16:9';
  const maxsec = Number(args.maxsec || 10);
  const width = Number(args.width || 1600);
  const ff = findFfmpeg();

  try {
    const link = await pexelsVideo(args.query, aspect);
    const tmp = path.join(os.tmpdir(), `wf-vid-${Date.now()}.mp4`);
    await download(link, tmp);
    fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });

    if (!ff) {
      // No ffmpeg: ship the raw download (works, just larger).
      fs.copyFileSync(tmp, args.out);
      console.log(JSON.stringify({ ok: true, source: 'pexels', optimized: false, out: args.out, note: 'ffmpeg not found; raw file used' }));
      process.exit(0);
    }

    const scale = `scale=${width}:-2:flags=lanczos`;
    // Optimized, silent, trimmed mp4 (H.264, web-friendly).
    execFileSync(ff, ['-y', '-i', tmp, '-t', String(maxsec), '-an', '-vf', scale, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '26', '-movflags', '+faststart', args.out], { stdio: 'ignore' });

    const result = { ok: true, source: 'pexels', optimized: true, out: args.out };
    if (args.poster) {
      execFileSync(ff, ['-y', '-i', args.out, '-vframes', '1', '-q:v', '3', args.poster], { stdio: 'ignore' });
      result.poster = args.poster;
    }
    if (args.webm) {
      execFileSync(ff, ['-y', '-i', tmp, '-t', String(maxsec), '-an', '-vf', scale, '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', args.webm], { stdio: 'ignore' });
      result.webm = args.webm;
    }
    fs.rmSync(tmp, { force: true });
    const kb = Math.round(fs.statSync(args.out).size / 1024);
    result.kb = kb;
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(JSON.stringify({ ok: false, error: e.message }));
    process.exit(1);
  }
}

main();
