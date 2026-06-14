# Wereact Website Factory 🏭

An autonomous, multi-agent pipeline that turns a **freeform brief** into a
**live, deployed, SEO/GEO-optimized website** at a `*.vercel.app` URL — the kind
of site you charge $10k+ for. You give one paragraph; the crew does the rest;
you review one finished, deployed result.

Separate from the `dkm-apis` backend. See [the design spec](docs/specs/2026-06-13-website-factory-design.md).

---

## 🚀 How to trigger it

**Folder-based intake (recommended):**
```bash
node new-client.mjs atlas-coffee "Atlas Coffee"   # scaffolds clients/atlas-coffee/
```
Fill in `brief.md` / `branding.md` / `design.md` with whatever you have (drop a
logo in `assets/` if you've got one — blanks are auto-generated at award level),
then tell me:

> **"build atlas-coffee"**

I read the folder, **obey what you wrote, generate the rest, write my choices back**
into branding.md/design.md for your approval, and hand back a live preview URL.

**Or just freeform** (the factory fills everything itself):

> **"Build a website for a boutique Lisbon coffee roaster, Atlas Coffee — premium,
> warm, sells subscriptions, for specialty-coffee enthusiasts."**

To iterate after reviewing the preview:

> "On the Atlas site, make the hero darker and rewrite the FAQ to focus on shipping."

---

## 🤖 What runs (the crew)

```
Strategy → Design (3 variants + judge) → Content (copy ∥ assets)
   → Build (Next.js) → SEO/GEO (claude-seo) → Deploy (GitHub + Vercel)
   → QA (4 lenses ∥) → Fix + redeploy → ✅ preview URL
```

Stack: **Next.js (App Router) + Tailwind v4**, from the polished `template/`.
Quality gate before you see it: clean build, Lighthouse ≥95, responsive,
accessible, real copy, distinctive design, valid schema.

---

## 🔌 Required connections (one-time, only you can do these)

| # | Connection | How to set up | Used for |
|---|---|---|---|
| 1 | **Vercel** | I'll trigger the Vercel MCP login, or run `vercel login` | Deploy + hosting |
| 2 | **GitHub** | `~/.local/bin/gh auth login` (choose HTTPS, browser) | Per-client repos + push |
| 3 | **Gemini API key** | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) → paste into `.env` as `GEMINI_API_KEY` | Asset Engine (primary image backup) |
| 4 | **fal.ai API key** | [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) → `.env` as `FAL_KEY` | Asset Engine (FLUX heroes) |
| 5 | **Together AI key** | [api.together.ai](https://api.together.ai/settings/api-keys) → `.env` as `TOGETHER_API_KEY` | Asset Engine (FLUX fallback) |

Already wired: **higgsfield** (MCP), **gstack** (browser QA), **frontend-design**, **claude-seo**.

```bash
cp .env.example .env   # then paste your keys
```

---

## 🗂 Layout

```
wereact-website-factory/
├── docs/specs/                   # design spec
├── template/                     # Next.js + Tailwind starter (SEO/GEO baked in)
├── tools/gen-image.mjs           # Asset Engine — 4-provider image fallback
├── workflows/website-factory.mjs # the crew (run via the Workflow tool)
├── clients/<slug>/               # generated sites land here, then get their own GitHub repo
└── .env                          # your API keys (gitignored)
```

## 🧪 Asset Engine (standalone test)

```bash
node tools/gen-image.mjs --prompt "cinematic dark coffee roastery, steam, warm light" \
  --out /tmp/test.png --type hero
```
Tries Gemini → fal.ai → Together in order; prints which provider succeeded.
