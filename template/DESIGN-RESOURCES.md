# Design resources available to the builder

Use these to reach **premium / Awwwards-grade** output. Compose from this
vocabulary instead of hand-writing every element from scratch.

## Premium component kit (`@/components/premium/`)
All reduced-motion safe, Tailwind v4 + framer-motion, brand-token aware.
- `Marquee` — infinite logo/testimonial/tag strip (`reverse`, `vertical`, `pauseOnHover`)
- `BentoGrid` + `BentoCard` — modern asymmetric feature grid (use `md:col-span-2`, `md:row-span-2`)
- `Spotlight` — cursor-following radial glow; wrap a hero/section
- `ShimmerButton` — premium CTA with traveling light edge
- `TiltCard` — 3D perspective tilt on hover (tour/product cards)
- `InfiniteMovingCards` — auto-scrolling testimonials (`items=[{quote,name,title}]`)
- `AnimatedGradientText` — flowing brand-gradient text (kicker / hero word)

## Motion kit (`@/components/ui/`)
`SmoothScroll` (global), `Cursor`, `Magnetic`, `Parallax`, `SplitText`,
`PageTransition`, `Reveal`. See template README.

## Advanced scroll-motion library (`@/components/motion/`) — the high-craft stuff
Use these for award-level scroll storytelling (GSAP ScrollTrigger, all reduced-motion safe):
- `ScrollScrubVideo` — video playhead driven by scroll (cinematic product/UGC reveal). Feed an ffmpeg-optimized mp4.
- `ImageSequence` — canvas frame-sequence on scroll = the "product rotates as you scroll" (watch/car/bottle 360). Pass `frames=[urls]`.
- `PinnedHorizontal` — section pins, track scrolls sideways (galleries, tours, fleet, portfolio).
- `StickyStack` — stacking cards that pin + scale as the next scrolls over (process/features storytelling).
- `Counter` — count-up stat on view (trust/stat rows).
**Don't apply the same fade-up to everything** — pick a brand-specific motion signature and compose these.

## Visual (`@/components/visual/`)
- `ShaderHeroClient` — lightweight WebGL gradient (template's own shader)
- `ShaderGradientHero` — **shadergradient.co** animated gradient (premium, brand colors) — `colors={[brand600,brand400,brand900]}`, `type` plane|sphere|waterPlane
- `BgVideo` — lazy, poster-first background video
- `Lottie` — lazy vector animation
(All dynamic / ssr:false / reduced-motion safe.)

## Inspiration galleries (the Research stage studies these)
- **supahero.io** — best hero sections; study for the hero composition
- **dark.design** — premium dark-theme sites (use when the brief is dark/cinematic)
- awwwards.com · godly.website · land-book.com · lapa.ninja

## Base UI (`@/components/ui/button`)
shadcn-style `Button` (variants: default/outline/ghost/white). Add more shadcn
components on demand: `npx shadcn@latest add <name>` (Tailwind v4 / new-york style).
Pull Magic UI / Aceternity components via their registries:
`npx shadcn@latest add "https://magicui.design/r/<comp>.json"`.

## Fonts — prefer characterful, premium type
- **Google Fonts** via `next/font/google` (default path; e.g. Fraunces, Sora, Clash-like).
- **Fontshare** (free, premium feel: Satoshi, Clash Display, General Sans, Cabinet Grotesk):
  add to `app/globals.css` top:
  `@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=clash-display@600&display=swap');`
  then set `--font-display-stack` / `--font-sans-stack` to the family names.
- Avoid defaulting to Inter-everywhere — pick type with personality per the design.

## Icons
`lucide-react` is installed: `import { MapPin, Compass } from 'lucide-react'`.

## Tooling / MCPs (for QA stage)
- **Lighthouse** (`<factory>/node_modules/.bin/lighthouse <url> --output=json`) — measure CWV; aim 95–100.
- **Chrome DevTools MCP** — live browser inspect, perf traces, console (ToolSearch: "chrome devtools").
- **21st.dev Magic MCP** — generate bespoke premium components on demand (ToolSearch: "magic component").
- **gstack browse** — headless QA / screenshots.
