# Wereact site template

Next.js (App Router) + Tailwind CSS v4 starter the factory clones per client.

## What's baked in
- **SEO:** per-page metadata (`lib/seo.ts`), canonical URLs, OpenGraph/Twitter
  cards, `app/sitemap.ts`, `app/robots.ts`.
- **GEO:** JSON-LD via `components/Schema.tsx` (Organization, WebSite, FAQPage,
  Breadcrumb), FAQ section that emits FAQ schema, semantic HTML, entity-rich
  config in `site.config.ts`.
- **Design:** Tailwind v4 theme tokens (`app/globals.css`), display + body
  fonts, framer-motion scroll reveals that respect reduced-motion.
- **Sections:** Header, Hero, Features, FAQ, CTA, Footer (in `components/site/`).

## Per-project flow (the factory does this)
1. Edit `site.config.ts` (name, url, brand, org, nav).
2. Override theme tokens in `app/globals.css`.
3. Fill sections with real copy; add routes under `app/`.
4. Drop generated images into `public/` (Asset Engine).
5. `npm install && npm run build` → deploy to Vercel.

## Motion & visual kit (Awwwards-grade, performance-balanced)
Reusable primitives — all respect `prefers-reduced-motion`:
- `components/ui/SmoothScroll` — Lenis smooth scroll (global, in layout)
- `components/ui/Cursor` — custom trailing cursor (desktop only)
- `components/ui/Magnetic` — magnetic hover for buttons/logo
- `components/ui/Parallax` — GSAP ScrollTrigger scroll-depth
- `components/ui/SplitText` — word-by-word headline reveal (real text, SEO-safe)
- `components/ui/PageTransition` — route transition (wired via `app/template.tsx`)
- `components/ui/Reveal` — framer-motion scroll reveal
- `components/visual/BgVideo` — lazy, poster-first background video
- `components/visual/ShaderHeroClient` — animated WebGL gradient (dynamic, `ssr:false`)
- `components/visual/Lottie` — lazy Lottie vector animation

WebGL (three.js / R3F) and Lottie are dynamically imported so they stay out of
the initial bundle — the home route's first load stays light.

Assets: `tools/gen-image.mjs` (stock/AI images) and `tools/gen-video.mjs`
(Pexels video → ffmpeg-optimized web loop + poster).

## Local dev
```bash
npm install
npm run dev
```
