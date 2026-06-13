# Wereact Website Factory — Design Spec

**Date:** 2026-06-13
**Status:** Approved
**Owner:** Anas

## Purpose

An autonomous, multi-agent pipeline that turns a freeform client brief into a
live, deployed, SEO/GEO-optimized website at a `*.vercel.app` preview URL —
production quality, the kind you can charge $10k+ for. The operator (you) gives
a one-paragraph brief, the factory runs the full crew, and you review one
finished, deployed result. Re-running with feedback iterates.

Unrelated to the `dkm-apis` backend. Lives in its own project + git repo.

## Decisions (locked)

| Area | Decision |
|---|---|
| Hosting | Vercel (MCP) |
| Stack | Next.js (App Router) + Tailwind CSS |
| Code storage | GitHub, one repo per client |
| Domains | Free `*.vercel.app` subdomain first; attach real domains later |
| Autonomy | Build everything autonomously → review one deployed preview at the end |
| Intake | Freeform description from the operator |
| Content/assets | Factory generates everything (copy + imagery); operator curates |
| Orchestration | Full multi-agent Workflow (the crew) |
| SEO/GEO | `claude-seo` plugin baked into a dedicated stage; SEO/GEO primitives in the template |

## The crew & pipeline

| Stage | Agents | Parallel | Output |
|---|---|---|---|
| 1. Strategy | 1 Strategist | — | Structured spec (goal, audience, pages, tone, sections, brand, keywords) |
| 2. Design direction | 3 Designers + 1 Judge | ✅ 3 variants | Winning design system (color, type, spacing, layout, motion) |
| 3. Copy | N Copywriters (1/page) | ✅ per page | Page copy + SEO meta + GEO-friendly Q&A blocks |
| 4. Assets | N Asset agents | ✅ per asset | Hero/section imagery, OG images, icons (via Asset Engine) |
| 5. Build | 1 Lead Builder | sequential | Assembled Next.js app from template + spec + copy + assets |
| 6. SEO/GEO | 1 SEO agent (claude-seo) | — | Schema.org JSON-LD, meta, sitemap/robots, E-E-A-T + GEO pass, fixes |
| 7. QA | 4 QA agents | ✅ layout/responsive/perf/a11y | Bug list → fixes (real browser via gstack) |
| 8. Deploy | 1 Deployer | — | GitHub repo + Vercel deploy → preview URL |

**Why build is sequential:** parallel agents editing one Next.js app collide.
Fan-out happens where work is independent (design exploration, copy, assets, QA).

## Asset Engine

A provider-agnostic CLI (`tools/gen-image.mjs`) with an automatic fallback chain.
The factory's asset agents call it; if a provider is rate-limited/out of quota,
it tries the next:

```
higgsfield (cinematic + video, via MCP — when available)
  ↓  Google Gemini "Nano Banana" (Gemini 2.5 Flash Image) — primary image backup
  ↓  FLUX via fal.ai — photoreal heroes
  ↓  FLUX via Together AI — last-resort free schnell
```

Provider selection can be per-asset-type. Images are saved into the target
project's `public/` and referenced by the build.

## SEO + GEO

- **Template primitives:** per-page `metadata` helpers, OpenGraph/Twitter cards,
  `sitemap.ts`, `robots.ts`, JSON-LD `<Schema>` component, semantic HTML,
  canonical URLs.
- **GEO (Generative Engine Optimization):** content structured for AI Overviews
  / LLM answer engines — clear Q&A blocks, definitional intros, FAQ schema,
  entity-rich copy, citable claims.
- **Audit pass:** `claude-seo` (`/seo audit`, `/seo geo`, `/seo schema`) runs in
  Stage 6 against the local build / preview, and fixes are applied before QA.

## Quality gate (definition of done)

Before a preview is surfaced to the operator:
- Builds clean (`next build` passes, no type errors)
- Lighthouse ≥ 95 (Performance, Accessibility, Best Practices, SEO)
- Fully responsive — verified in real browser at mobile/tablet/desktop
- Accessible — semantic HTML, contrast, alt text, keyboard nav
- No placeholder/lorem text; all copy real
- Distinctive design — passes frontend-design's non-generic check
- SEO/GEO: schema valid, meta complete, sitemap/robots present

## Project layout

```
wereact-website-factory/
├── docs/specs/                  # this spec
├── template/                    # Next.js + Tailwind starter (cloned per project)
├── tools/gen-image.mjs          # Asset Engine (4-provider fallback)
├── workflows/website-factory.mjs # the Workflow crew script
├── clients/<slug>/              # generated sites land here before their GitHub repo
├── .env.example                 # API keys template
└── README.md                    # trigger + connections
```

## Required connections (operator-provided, one-time)

| Connection | How | Why |
|---|---|---|
| Vercel | authenticate Vercel MCP | deploy + host |
| GitHub | `gh auth login` | per-client repos + push |
| Gemini API key | Google AI Studio | Asset Engine primary backup |
| fal.ai API key | fal.ai dashboard | Asset Engine FLUX |
| Together AI key | together.ai | Asset Engine FLUX fallback |

Already connected: higgsfield (MCP), gstack (browse/QA), frontend-design, claude-seo.

## Trigger

Operator gives a freeform brief and asks to build; the orchestrator runs the
`website-factory` workflow with the brief as `args`. Result: a preview URL.
