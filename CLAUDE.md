# Wereact Website Factory — operating instructions

This project is an **autonomous, multi-agent website factory**. It turns a
freeform brief into a live, deployed, SEO/GEO-optimized, Awwwards-grade Next.js
site. Read this fully before acting in this repo.

## Intake model (folder-based)
Each client is a folder `clients/<slug>/` scaffolded from `clients/_TEMPLATE/`:
  - `brief.md` — goal, audience, pages, CTA
  - `branding.md` — name, voice, colors, fonts, logo, guardrails
  - `design.md` — references, mood, layout, motion intensity, hero treatment, sections
  - `assets/` — optional logo (logo.svg/png → used + favicon + palette seed), photos, fonts, copy
Scaffold a new one: `node new-client.mjs <slug> "Client Name"`.
**Rule:** values the operator filled in are LOCKED (obeyed); blanks are generated at
award level and **written back** into branding.md/design.md for approval. Logo is
used if present in assets/, otherwise the factory designs an SVG wordmark.

## How to START a build (the trigger)
When the operator says "build <slug>" / "build a website…" / "run the factory":

1. Determine the `slug`. If `clients/<slug>/` doesn't exist yet, scaffold it
   (`node new-client.mjs <slug> "Name"`) and ask the operator to fill it in — OR
   proceed from a freeform brief they gave (the factory fills everything).
2. Run the **Workflow tool**:
   - `name: "website-factory"` (registered at `~/.claude/workflows/website-factory.mjs`)
   - `args: { brief: "<any freeform text, may be empty>", slug: "<slug>", clientDir: "/Users/apple/Desktop/wereact-website-factory/clients/<slug>", factoryRoot: "/Users/apple/Desktop/wereact-website-factory" }`
   The Strategist reads the folder's md files + assets itself.
3. Crew runs (Strategy → Design → Interaction → write-back → Content → Build →
   SEO/GEO → Deploy → QA → Fix) and returns a live `*.vercel.app` URL.
4. Report preview URL + repo URL. Iterate by editing the folder / feedback and re-running.

The Workflow tool requires explicit user opt-in to multi-agent orchestration —
the operator asking to build a site IS that opt-in.

## Layout
- `template/` — Next.js 14 + Tailwind v4 starter (cloned per client). Motion kit +
  WebGL + video + SEO/GEO baked in. See `template/README.md`.
- `tools/gen-image.mjs` — images: free stock (Pexels→Unsplash) → AI (Together→fal→Gemini).
- `tools/gen-video.mjs` — free Pexels video → ffmpeg-optimized web loop + poster.
- `workflows/website-factory.mjs` — the crew (canonical copy; mirror to ~/.claude/workflows/).
- `clients/<slug>/` — generated sites land here, then get their own GitHub repo.
- `docs/specs/` — design spec.  `.env` — API keys (gitignored).

## Environment gotchas (macOS 13, Tier 3)
- Use `bun` at `~/.bun/bin/bun`, `gh` at `~/.local/bin/gh`, `ffmpeg` at `~/.local/bin/ffmpeg`.
- npm MUST use a project-local cache: `npm install --cache ./.npm-cache` (sandbox blocks ~/.npm).
- Don't `brew install` heavy formulae (builds from source on this OS) — use prebuilt binaries.

## Connections (state as of setup)
- ✅ GitHub (`gh`, user anasbenabbou), Vercel (token in .env), Pexels, Unsplash.
- 🟡 Gemini key valid but image gen needs billing; fal key valid but needs balance.
- ⏳ OpenAI/GPT key to be added later (will extend the Asset Engine).
- If a build fails on deploy/assets, check `.env` keys first.

## Editing the workflow
After editing `workflows/website-factory.mjs`, copy it to
`~/.claude/workflows/website-factory.mjs` so the global trigger stays in sync.
The script uses Workflow-runtime globals (agent/parallel/phase/log/args) and
top-level await/return — `node --check` will flag "Illegal return" (a false positive).
