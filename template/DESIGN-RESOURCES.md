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

## Visual (`@/components/visual/`)
`ShaderHeroClient` (WebGL gradient), `BgVideo` (lazy video bg), `Lottie`.

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
